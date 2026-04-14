using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Models;

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
        [HttpPatch("me/role")]
        [EndpointSummary("Upgrade Role to Business Owner")]
        [EndpointDescription("Upgrades the authenticated user's role from partner/client to owner. " +
            "Preserves any existing BusinessPartner associations. " +
            "After this call, the client should call POST /auth/refresh to receive a new JWT with the updated role.")]
        public async Task<IActionResult> UpgradeRoleToOwner()
        {
            var currentUserIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(currentUserIdStr, out var currentUserId))
                return Unauthorized();

            var roleStr = User.FindFirstValue(ClaimTypes.Role);
            if (roleStr == UserRole.owner.ToString())
                return Conflict(new { error = "User is already a business owner." });

            try
            {
                await _userRepository.UpdateUserRoleToOwnerAsync(currentUserId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
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
            var currentUserIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(currentUserIdStr, out var currentUserId) || currentUserId != id)
                return Forbid();

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