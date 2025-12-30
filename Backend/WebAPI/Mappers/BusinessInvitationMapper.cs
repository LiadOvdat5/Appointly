using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Mappers
{
    public static class BusinessInvitationMapper
    {
        public static BusinessInvitation ToBusinessInvitation(
            InviteWorkerDTO dto,
            Guid businessId,
            Guid inviterId,
            Guid? workerId,
            DateTime expirationDate)
        {
            return new BusinessInvitation
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                InviterId = inviterId,
                WorkerEmail = dto.WorkerEmail,
                WorkerId = workerId,
                Message = dto.Message,
                Status = InvitationStatus.Pending,
                InvitedAt = DateTime.UtcNow,
                ExpirationDate = expirationDate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        public static BusinessInvitationDTO ToBusinessInvitationDTO(BusinessInvitation invitation, string businessName)
        {
            return new BusinessInvitationDTO
            {
                Id = invitation.Id,
                BusinessId = invitation.BusinessId,
                BusinessName = businessName,
                InviterId = invitation.InviterId,
                WorkerId = invitation.WorkerId,
                WorkerEmail = invitation.WorkerEmail,
                Status = invitation.Status,
                Message = invitation.Message,
                InvitedAt = invitation.InvitedAt,
                RespondedAt = invitation.RespondedAt,
                ExpirationDate = invitation.ExpirationDate
            };
        }
    }
}
