using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebAPI.DTOs;
using WebAPI.Interfaces;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("invitations")]
    public class InvitationController : ControllerBase
    {
        private readonly IBusinessInvitationRepository _businessInvitationRepository;

        public InvitationController(IBusinessInvitationRepository businessInvitationRepository)
        {
            _businessInvitationRepository = businessInvitationRepository;
        }

        // GET /invitations/my
        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyInvitations()
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString == null) return Unauthorized();
                Guid userId = Guid.Parse(userIdString);

                var invitations = await _businessInvitationRepository.GetInvitationsForWorkerAsync(userId);
                return Ok(invitations);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // POST /invitations/{id}/respond
        [Authorize]
        [HttpPost("{invitationId}/respond")]
        public async Task<IActionResult> RespondToInvitation(Guid invitationId, [FromBody] bool respond)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString == null) return Unauthorized();
                Guid userId = Guid.Parse(userIdString);

                
                var invitation = await _businessInvitationRepository.RespondToInvitationAsync(invitationId, userId, respond);
                return Ok(invitation);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
