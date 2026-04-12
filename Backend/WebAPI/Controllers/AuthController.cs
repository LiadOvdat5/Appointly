using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.AspNetCore.RateLimiting;
using WebAPI.DTOs;
using WebAPI.Exceptions;
using WebAPI.Interfaces;
using WebAPI.Models;
using WebAPI.Services;
using Microsoft.Extensions.Configuration;


namespace WebAPI.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepository;
        private readonly IJwtService _jwtService;
        private readonly string _googleClientId;
        private readonly string _frontendBaseUrl;
        private readonly IHostEnvironment _env;

        public AuthController(IAuthRepository authRepository, IJwtService jwtService, IConfiguration configuration, IHostEnvironment env)
        {
            _authRepository = authRepository;
            _jwtService = jwtService;
            _googleClientId = configuration["Google:ClientId"]
                ?? throw new InvalidOperationException("Google:ClientId is not configured.");
            _frontendBaseUrl = configuration["FrontendBaseUrl"] ?? "http://localhost:5173";
            _env = env;
        }


        [HttpPost("register")]
        [EnableRateLimiting("auth")]
        [EndpointSummary("User Registration")]
        [EndpointDescription("Create a new user account. Email must be unique. Password will be securely hashed. " +
            "Returns the created user with ID. Example: { \"name\": \"John Doe\", \"email\": \"john@example.com\", \"password\": \"SecurePass123!\" }")]
        public async Task<IActionResult> Register([FromBody] RegisterUserDTO registerDto)
        {
            try
            {
                var user = await _authRepository.RegisterAsync(registerDto);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        private CookieOptions BuildAuthCookieOptions(DateTime expiresAt)
        {
            // In development: SameSite=Lax works fine on localhost (same-origin, no HTTPS needed).
            // In all other environments (demo, prod): frontend and backend are on different domains,
            // so SameSite must be None + Secure=true or browsers silently drop the cookie on
            // cross-site requests, causing every authenticated call to return 401.
            var crossDomain = !_env.IsDevelopment();
            return new CookieOptions
            {
                HttpOnly = true,
                Secure = crossDomain,
                SameSite = crossDomain ? SameSiteMode.None : SameSiteMode.Lax,
                Expires = expiresAt,
                Path = "/"
            };
        }

        private void SetAuthCookies(LoginResponseDTO result)
        {
            Response.Cookies.Append("access_token", result.Token, BuildAuthCookieOptions(result.ExpiresAt));
            Response.Cookies.Append("refresh_token", result.RefreshToken, BuildAuthCookieOptions(result.RefreshTokenExpiry));
        }

        [HttpPost("login")]
        [EnableRateLimiting("auth")]
        [EndpointSummary("User Login")]
        [EndpointDescription("Authenticate user with email and password. Returns user data and sets JWT token in HttpOnly cookie. " +
            "The token will be automatically included in subsequent requests. Example: { \"email\": \"john@example.com\", \"password\": \"SecurePass123!\" }")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
        {
            try
            {
                var loginResult = await _authRepository.LoginAsync(loginDto);

                SetAuthCookies(loginResult);

                // Return only non-sensitive data in response body
                return Ok(new
                {
                    user = loginResult.User,
                    expiresAt = loginResult.ExpiresAt
                });
            }
            catch (SuspendedAccountException ex)
            {
                return StatusCode(403, new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }

        [HttpPost("logout")]
        [Authorize]
        [EndpointSummary("User Logout")]
        [EndpointDescription("Log out the current user. Clears both JWT and refresh token cookies and revokes the refresh token in the database.")]
        public async Task<IActionResult> Logout()
        {
            var userIdStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdStr, out var userId))
                await _authRepository.RevokeRefreshTokenAsync(userId);

            // Must use the same options as when the cookies were set —
            // browsers reject deletions that don't match the original SameSite/Secure/Path.
            var expiredOptions = BuildAuthCookieOptions(DateTime.UtcNow.AddDays(-1));
            Response.Cookies.Append("access_token", "", expiredOptions);
            Response.Cookies.Append("refresh_token", "", expiredOptions);

            return Ok(new { success = true });
        }

        [HttpPost("refresh")]
        [EndpointSummary("Refresh Access Token")]
        [EndpointDescription("Uses the refresh_token cookie to issue a new access_token + rotated refresh_token. Returns 401 if the refresh token is missing, invalid, or expired.")]
        public async Task<IActionResult> Refresh()
        {
            if (!Request.Cookies.TryGetValue("refresh_token", out var refreshToken) || string.IsNullOrWhiteSpace(refreshToken))
                return Unauthorized(new { error = "Refresh token missing." });

            try
            {
                var loginResult = await _authRepository.RefreshAsync(refreshToken);
                SetAuthCookies(loginResult);

                return Ok(new
                {
                    user = loginResult.User,
                    expiresAt = loginResult.ExpiresAt
                });
            }
            catch (SuspendedAccountException ex)
            {
                return StatusCode(403, new { error = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                Response.Cookies.Delete("access_token");
                Response.Cookies.Delete("refresh_token");
                return Unauthorized(new { error = "Session expired. Please log in again." });
            }
        }

        [HttpPost("google")]
        [EndpointSummary("Google OAuth Sign-In / Sign-Up")]
        [EndpointDescription("Validates a Google id_token, creates the user on first sign-in, and issues the same JWT HTTP-only cookie as credential login. " +
            "Pass role on first sign-up; omit on subsequent logins.")]
        public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthDTO dto)
        {
            try
            {
                var loginResult = await _authRepository.GoogleAuthAsync(dto, _googleClientId);

                SetAuthCookies(loginResult);

                return Ok(new
                {
                    user = loginResult.User,
                    expiresAt = loginResult.ExpiresAt
                });
            }
            catch (SuspendedAccountException ex)
            {
                return StatusCode(403, new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("forgot-password")]
        [EnableRateLimiting("auth")]
        [EndpointSummary("Request Password Reset")]
        [EndpointDescription("Sends a password-reset email to the given address. Always returns 200 OK — does not reveal whether the email exists.")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO dto)
        {
            try
            {
                await _authRepository.ForgotPasswordAsync(dto.Email, _frontendBaseUrl);
                return Ok(new { message = "If an account exists for that email, a reset link has been sent." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        [EnableRateLimiting("auth")]
        [EndpointSummary("Reset Password")]
        [EndpointDescription("Validates the reset token and updates the user's password. Token is valid for 1 hour.")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO dto)
        {
            try
            {
                await _authRepository.ResetPasswordAsync(dto.Token, dto.NewPassword);
                return Ok(new { message = "Password updated successfully. You can now log in." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("me")]
        [Authorize]
        [EndpointSummary("Get Current User")]
        [EndpointDescription("Returns the authenticated user's information in the same shape as /auth/login: " +
            "{ user: { id, name, role }, expiresAt }. Requires a valid JWT token in the access_token cookie.")]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
                if (userIdClaim == null)
                    return Unauthorized(new { error = "Invalid token" });

                var user = await _authRepository.GetUserByEmailAsync(
                    User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "");

                if (user == null)
                    return NotFound(new { error = "User not found" });

                if (user.IsSuspended)
                    return StatusCode(403, new { error = string.IsNullOrWhiteSpace(user.SuspendedReason)
                        ? "Your account has been suspended."
                        : $"Your account has been suspended: {user.SuspendedReason}" });

                // Read token expiry from the JWT exp claim (Unix seconds → DateTime)
                var expClaim = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Exp)?.Value;
                var expiresAt = expClaim != null && long.TryParse(expClaim, out var expSeconds)
                    ? DateTimeOffset.FromUnixTimeSeconds(expSeconds).UtcDateTime
                    : DateTime.UtcNow.AddDays(7);

                // Read businessId: first try JWT claim, then fall back to DB for partners
                // (the JWT may be stale if the user's role was upgraded after their last login)
                var businessIdClaim = User.FindFirst("businessId")?.Value;
                Guid? businessId = businessIdClaim != null && Guid.TryParse(businessIdClaim, out var bid) ? bid : null;

                if (businessId == null && user.Role == UserRole.partner)
                {
                    businessId = await _authRepository.GetPartnerBusinessIdAsync(user.Id);
                }

                return Ok(new
                {
                    user = new { id = user.Id, name = user.Name, role = user.Role, businessId },
                    expiresAt
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
