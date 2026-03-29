using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Utilities;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FollowController : ControllerBase
    {
        private readonly IFollowRepository _followRepository;

        public FollowController(IFollowRepository followRepository)
        {
            _followRepository = followRepository;
        }

        /// <summary>
        /// Follow a business
        /// </summary>
        [HttpPost]
        [EndpointSummary("Follow Business")]
        [EndpointDescription("Follow a business. Only authenticated customers can follow businesses. Returns 409 if already following.")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<FollowDTO>> Follow([FromBody] CreateFollowDTO dto)
        {
            var userId = User.GetUserId();
            if (!userId.HasValue)
                return Unauthorized("User is not authenticated.");

            try
            {
                var result = await _followRepository.FollowAsync(userId.Value, dto.BusinessId);
                return StatusCode(StatusCodes.Status201Created, result);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        /// <summary>
        /// Unfollow a business
        /// </summary>
        [HttpDelete("{businessId:guid}")]
        [EndpointSummary("Unfollow Business")]
        [EndpointDescription("Unfollow a business by its ID. Returns 404 if the follow record does not exist.")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Unfollow(Guid businessId)
        {
            var userId = User.GetUserId();
            if (!userId.HasValue)
                return Unauthorized("User is not authenticated.");

            var removed = await _followRepository.UnfollowAsync(userId.Value, businessId);
            if (!removed)
                return NotFound("Follow record not found.");

            return NoContent();
        }

        /// <summary>
        /// Get all businesses followed by the current user
        /// </summary>
        [HttpGet("user")]
        [EndpointSummary("Get Followed Businesses")]
        [EndpointDescription("Returns all businesses the authenticated user follows.")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<IEnumerable<BusinessDTO>>> GetFollowedBusinesses()
        {
            var userId = User.GetUserId();
            if (!userId.HasValue)
                return Unauthorized("User is not authenticated.");

            var businesses = await _followRepository.GetFollowedBusinessesAsync(userId.Value);
            return Ok(businesses);
        }

        /// <summary>
        /// Check follow status for a specific business
        /// </summary>
        [HttpGet("status/{businessId:guid}")]
        [EndpointSummary("Get Follow Status")]
        [EndpointDescription("Returns whether the current user follows the specified business.")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<FollowStatusDTO>> GetFollowStatus(Guid businessId)
        {
            var userId = User.GetUserId();
            if (!userId.HasValue)
                return Unauthorized("User is not authenticated.");

            var status = await _followRepository.GetFollowStatusAsync(userId.Value, businessId);
            return Ok(status);
        }
    }
}
