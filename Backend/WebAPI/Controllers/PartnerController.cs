using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebAPI.Interfaces;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("partners")]
    public class PartnerController : ControllerBase
    {
        private readonly IStaffRepository _staffRepository;

        public PartnerController(IStaffRepository staffRepository)
        {
            _staffRepository = staffRepository;
        }

        [Authorize]
        [HttpGet("me/stats")]
        [EndpointSummary("Get Partner Stats")]
        [EndpointDescription("Returns a dashboard snapshot for the authenticated partner: next appointment, today's count, this week's count, assigned services, and workplace info. " +
            "Authorization: Only the authenticated partner can call this endpoint.")]
        public async Task<IActionResult> GetMyStats()
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString == null) return Unauthorized();
                var partnerId = Guid.Parse(userIdString);

                var stats = await _staffRepository.GetPartnerStatsAsync(partnerId);
                return Ok(stats);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
