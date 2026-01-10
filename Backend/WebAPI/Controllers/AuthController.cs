using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Services;


namespace WebAPI.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _authRepository;
        private readonly IJwtService _jwtService;

        public AuthController(IAuthRepository authRepository, IJwtService jwtService)
        {
            _authRepository = authRepository;
            _jwtService = jwtService;
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
        [EndpointDescription("Authenticate user with email and password. Returns a JWT token for subsequent authenticated requests. " +
            "Include the token in the Authorization header as: Bearer {token}. Example: { \"email\": \"john@example.com\", \"password\": \"SecurePass123!\" }")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
        {
            try
            {
                var token = await _authRepository.LoginAsync(loginDto);
                return Ok(new { token });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
        }

        [HttpPost("logout")]
        [Authorize]
        [EndpointSummary("User Logout")]
        [EndpointDescription("Log out the current user. Clear the JWT token on the client side to complete logout. " +
            "For added security, consider implementing a token blacklist on the server.")]
        public async Task<IActionResult> Logout()
        {
            // JWT invalidation is typically handled client-side or via token blacklist
            return Ok(new { success = true });
        }
    }
}
