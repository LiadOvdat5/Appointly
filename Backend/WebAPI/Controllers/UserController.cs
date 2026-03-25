using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using WebAPI.DTOs;
using WebAPI.Interfaces;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("users")]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UserController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [Authorize]
        [HttpGet("{id}")]
        [EndpointSummary("Get User Details")]
        [EndpointDescription("Retrieve user information by ID. Returns user profile including name, email, and role. " +
            "Authorization: User can retrieve any user's profile. Example ID: 550e8400-e29b-41d4-a716-446655440000")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            try
            {
                var user = await _userRepository.GetUserByIdAsync(id);
                return Ok(user);
            }
            catch (Exception ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpPatch("{id}")]
        [EndpointSummary("Update User Profile")]
        [EndpointDescription("Update user profile information. Supports partial updates - only include fields you want to change. " +
            "Fields: name (string, optional), email (string, optional, must be unique), password (string, optional). " +
            "Example: { \"name\": \"Jane Doe\", \"email\": \"jane@example.com\" }. Authorization: Users can only update their own profile.")]
        public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDTO updateUserDTO)
        {
            try
            {
                var updatedUser = await _userRepository.UpdateUserAsync(id, updateUserDTO);
                return Ok(updatedUser);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }
    }
}