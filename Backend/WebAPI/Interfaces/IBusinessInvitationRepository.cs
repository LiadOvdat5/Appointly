using WebAPI.DTOs;

namespace WebAPI.Interfaces
{
    public interface IBusinessInvitationRepository
    {
        Task<BusinessInvitationDTO> InviteWorkerAsync(Guid businessId, Guid ownerId, InviteWorkerDTO dto);
        Task<IEnumerable<BusinessInvitationDTO>> GetInvitationsForWorkerAsync(Guid workerId);
        Task<BusinessInvitationDTO> RespondToInvitationAsync(Guid invitationId, Guid workerId, bool accept);
    }
}