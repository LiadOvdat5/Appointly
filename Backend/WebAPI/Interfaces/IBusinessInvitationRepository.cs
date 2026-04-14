using WebAPI.DTOs;

namespace WebAPI.Interfaces
{
    public interface IBusinessInvitationRepository
    {
        Task<BusinessInvitationDTO> InviteWorkerAsync(Guid businessId, Guid ownerId, InviteWorkerDTO dto);
        Task<IEnumerable<BusinessInvitationDTO>> GetInvitationsForWorkerAsync(Guid workerId);
        Task<BusinessInvitationDTO> RespondToInvitationAsync(Guid invitationId, Guid workerId, bool accept);
        /// <summary>
        /// Looks up an invitation by its email token. Used when an unregistered user
        /// clicks the invite link and lands on the registration page.
        /// </summary>
        Task<BusinessInvitationDTO?> GetInvitationByTokenAsync(string token);
        /// <summary>
        /// Auto-accepts a token-based invitation after the user registers.
        /// Links the new userId to the invitation and creates/updates the BusinessPartner record.
        /// </summary>
        Task AutoAcceptInvitationAsync(string token, Guid newUserId);
    }
}