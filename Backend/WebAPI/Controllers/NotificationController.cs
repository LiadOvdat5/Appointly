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
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        private Guid? GetCurrentUserId() => User.GetUserId();

        /// <summary>
        /// Get paginated notifications for the current user, newest first
        /// </summary>
        [HttpGet]
        [EndpointSummary("Get Notifications")]
        [EndpointDescription("Returns paginated notifications for the authenticated user, ordered newest first.")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<List<NotificationDTO>>> GetNotifications(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return Unauthorized();

            var notifications = await _notificationService.GetNotificationsForUserAsync(userId.Value, page, pageSize);
            return Ok(notifications);
        }

        /// <summary>
        /// Get unread notification count for the current user
        /// </summary>
        [HttpGet("unread-count")]
        [EndpointSummary("Get Unread Count")]
        [EndpointDescription("Returns the integer count of unread notifications for the authenticated user.")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return Unauthorized();

            var count = await _notificationService.GetUnreadCountAsync(userId.Value);
            return Ok(count);
        }

        /// <summary>
        /// Mark a single notification as read (idempotent)
        /// </summary>
        [HttpPost("{id}/read")]
        [EndpointSummary("Mark Notification As Read")]
        [EndpointDescription("Marks a single notification as read. Idempotent — no error if already read or not found.")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return Unauthorized();

            await _notificationService.MarkAsReadAsync(id, userId.Value);
            return NoContent();
        }

        /// <summary>
        /// Mark all notifications as read for the current user
        /// </summary>
        [HttpPost("read-all")]
        [EndpointSummary("Mark All Notifications As Read")]
        [EndpointDescription("Marks all unread notifications as read for the authenticated user.")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return Unauthorized();

            await _notificationService.MarkAllAsReadAsync(userId.Value);
            return NoContent();
        }
    }
}
