using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Models;
using WebAPI.Utilities;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/push")]
    public class PushController : ControllerBase
    {
        private readonly IPushSubscriptionRepository _repo;
        private readonly IConfiguration _configuration;

        public PushController(IPushSubscriptionRepository repo, IConfiguration configuration)
        {
            _repo = repo;
            _configuration = configuration;
        }

        private Guid? GetCurrentUserId() => User.GetUserId();

        /// <summary>Returns the VAPID public key so the frontend can subscribe.</summary>
        [HttpGet("vapid-public-key")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
        public IActionResult GetVapidPublicKey()
        {
            var key = _configuration["Vapid:PublicKey"];
            if (string.IsNullOrEmpty(key))
                return StatusCode(503, new { error = "Push notifications not configured on this server." });
            return Ok(new { publicKey = key });
        }

        /// <summary>Saves a push subscription for the authenticated user (idempotent by endpoint).</summary>
        [Authorize]
        [HttpPost("subscriptions")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Subscribe([FromBody] SavePushSubscriptionDTO dto)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return Unauthorized();

            var existing = await _repo.GetByEndpointAsync(dto.Endpoint);
            if (existing != null)
            {
                // Idempotent — re-associate with this user if it changed
                if (existing.UserId != userId.Value)
                {
                    existing.UserId = userId.Value;
                    await _repo.SaveChangesAsync();
                }
                return Ok();
            }

            var sub = new PushSubscription
            {
                UserId = userId.Value,
                Endpoint = dto.Endpoint,
                P256DH = dto.P256DH,
                Auth = dto.Auth,
                UserAgent = dto.UserAgent,
                CreatedAt = DateTime.UtcNow,
            };

            await _repo.AddAsync(sub);
            await _repo.SaveChangesAsync();
            return Ok();
        }

        /// <summary>Removes a push subscription by endpoint (on permission revoke or explicit unsubscribe).</summary>
        [Authorize]
        [HttpDelete("subscriptions")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Unsubscribe([FromBody] DeletePushSubscriptionDTO dto)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue) return Unauthorized();

            var sub = await _repo.GetByEndpointAsync(dto.Endpoint);
            if (sub == null || sub.UserId != userId.Value)
                return NoContent();

            await _repo.DeleteAsync(sub);
            await _repo.SaveChangesAsync();
            return NoContent();
        }
    }
}
