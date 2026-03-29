using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Models;
using WebAPI.Services;


namespace WebAPI.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepository;
        private readonly IJwtService _jwtService;
        private readonly AppDbContext _context;

        public AuthController(IAuthRepository authRepository, IJwtService jwtService, AppDbContext context)
        {
            _authRepository = authRepository;
            _jwtService = jwtService;
            _context = context;
        }


        [HttpPost("register")]
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


        [HttpPost("login")]
        [EndpointSummary("User Login")]
        [EndpointDescription("Authenticate user with email and password. Returns user data and sets JWT token in HttpOnly cookie. " +
            "The token will be automatically included in subsequent requests. Example: { \"email\": \"john@example.com\", \"password\": \"SecurePass123!\" }")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
        {
            try
            {
                var loginResult = await _authRepository.LoginAsync(loginDto);

                // Set token in HttpOnly cookie
                Response.Cookies.Append("access_token", loginResult.Token, new CookieOptions
                {
                    HttpOnly = true,        // Cannot be accessed by JavaScript
                    Secure = false,         // Set to true in production (HTTPS)
                    SameSite = SameSiteMode.Lax,
                    Expires = loginResult.ExpiresAt,
                    Path = "/"              // Available for all endpoints
                });

                // Return only non-sensitive data in response body
                return Ok(new
                {
                    user = loginResult.User,
                    expiresAt = loginResult.ExpiresAt
                });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }

        [HttpPost("logout")]
        [Authorize]
        [EndpointSummary("User Logout")]
        [EndpointDescription("Log out the current user. Clears the JWT token cookie. " +
            "For added security, consider implementing a token blacklist on the server.")]
        public async Task<IActionResult> Logout()
        {
            // Clear the access token cookie
            Response.Cookies.Delete("access_token");

            return Ok(new { success = true });
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
                    var partnerRecord = await _context.BusinessPartners
                        .FirstOrDefaultAsync(p => p.UserId == user.Id && p.Status == InvitationStatus.Accepted);
                    businessId = partnerRecord?.BusinessId;
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
