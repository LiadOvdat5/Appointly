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
        private readonly string _frontendBaseUrl;

        public InvitationController(IBusinessInvitationRepository businessInvitationRepository, IConfiguration configuration)
        {
            _businessInvitationRepository = businessInvitationRepository;
            _frontendBaseUrl = configuration["FrontendBaseUrl"] ?? "http://localhost:5173";
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

        [HttpGet("accept")]
        [EndpointSummary("Accept Invitation by Token")]
        [EndpointDescription("Used when an unregistered user clicks their invite link. " +
            "If the invitation token is valid and the user is already logged in, the invitation is auto-accepted. " +
            "Otherwise the user is redirected to /register?inviteToken=<token> to complete sign-up first.")]
        public async Task<IActionResult> AcceptByToken([FromQuery] string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest(new { error = "Token is required." });

            try
            {
                var invitation = await _businessInvitationRepository.GetInvitationByTokenAsync(token);
                if (invitation == null)
                    return Redirect($"{_frontendBaseUrl}/register?inviteError=invalid");

                if (invitation.ExpirationDate < DateTime.UtcNow)
                    return Redirect($"{_frontendBaseUrl}/register?inviteError=expired");

                // If the user is authenticated, auto-accept immediately
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString != null && Guid.TryParse(userIdString, out var userId))
                {
                    await _businessInvitationRepository.AutoAcceptInvitationAsync(token, userId);
                    return Redirect($"{_frontendBaseUrl}/staff-dashboard");
                }

                // Otherwise send them to register with the token preserved
                return Redirect($"{_frontendBaseUrl}/register?inviteToken={Uri.EscapeDataString(token)}");
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("expired"))
            {
                return Redirect($"{_frontendBaseUrl}/register?inviteError=expired");
            }
            catch (Exception)
            {
                return Redirect($"{_frontendBaseUrl}/register?inviteError=invalid");
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
