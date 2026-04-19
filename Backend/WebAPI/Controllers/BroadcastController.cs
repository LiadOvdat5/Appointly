using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Utilities;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/businesses/{businessId:guid}/broadcasts")]
    [Authorize]
    public class BroadcastController : ControllerBase
    {
        private readonly IBroadcastService _broadcastService;
        private readonly AppDbContext _context;

        public BroadcastController(IBroadcastService broadcastService, AppDbContext context)
        {
            _broadcastService = broadcastService;
            _context = context;
        }

        /// <summary>
        /// Send a broadcast to all followers of this business.
        /// Returns 202 Accepted — fan-out happens asynchronously.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(BroadcastDTO), StatusCodes.Status202Accepted)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> Send(Guid businessId, [FromBody] CreateBroadcastDTO dto)
        {
            var userId = User.GetUserId();
            if (!userId.HasValue) return Unauthorized();

            if (string.IsNullOrWhiteSpace(dto.Title) || dto.Title.Length > 100)
                return BadRequest(new { error = "Title must be between 1 and 100 characters." });

            if (string.IsNullOrWhiteSpace(dto.Body) || dto.Body.Length > 500)
                return BadRequest(new { error = "Body must be between 1 and 500 characters." });

            if (!await IsOwnerAsync(businessId, userId.Value))
                return Forbid();

            try
            {
                var result = await _broadcastService.SendAsync(businessId, dto);
                return StatusCode(StatusCodes.Status202Accepted, result);
            }
            catch (InvalidOperationException ex) when (ex.Message == "rate_limited")
            {
                var status = await _broadcastService.GetStatusAsync(businessId);
                return StatusCode(StatusCodes.Status429TooManyRequests, new
                {
                    error   = "Daily broadcast limit reached.",
                    resetsAt = status.ResetsAt,
                    limit   = status.DailyLimit,
                });
            }
        }

        /// <summary>
        /// Get paginated broadcast history for this business (owner only).
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetHistory(
            Guid businessId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = User.GetUserId();
            if (!userId.HasValue) return Unauthorized();

            if (!await IsOwnerAsync(businessId, userId.Value))
                return Forbid();

            pageSize = Math.Clamp(pageSize, 1, 50);
            var (items, total) = await _broadcastService.GetHistoryAsync(businessId, page, pageSize);

            return Ok(new
            {
                items,
                total,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling((double)total / pageSize),
            });
        }

        /// <summary>
        /// Get broadcast quota status for today (owner only).
        /// </summary>
        [HttpGet("status")]
        [ProducesResponseType(typeof(BroadcastStatusDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetStatus(Guid businessId)
        {
            var userId = User.GetUserId();
            if (!userId.HasValue) return Unauthorized();

            if (!await IsOwnerAsync(businessId, userId.Value))
                return Forbid();

            var status = await _broadcastService.GetStatusAsync(businessId);
            return Ok(status);
        }

        private async Task<bool> IsOwnerAsync(Guid businessId, Guid userId)
        {
            return await _context.Businesses
                .AnyAsync(b => b.Id == businessId && b.OwnerId == userId);
        }
    }
}
