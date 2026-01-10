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

        [Authorize]
        [HttpGet("my")]
        [EndpointSummary("Get My Invitations")]
        [EndpointDescription("Retrieve all pending business invitations for the current user. Returns invitations with status (Pending/Expired). " +
            "Includes: invitation ID, business name, inviter name, message, invitation date, and expiration date. " +
            "Automatically expires invitations older than 7 days. Authorization: Users can only view their own invitations.")]
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

        [Authorize]
        [HttpPost("{invitationId}/respond")]
        [EndpointSummary("Respond to Invitation")]
        [EndpointDescription("Accept or decline a business invitation. Once accepted, the user becomes a partner of the business. " +
            "The request body should be a boolean: true to accept, false to decline. " +
            "Example: true (in request body). " +
            "Status changes to 'Accepted' or 'Declined' accordingly. " +
            "Authorization: Users can only respond to their own invitations.")]
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
