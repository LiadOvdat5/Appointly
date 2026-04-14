using WebAPI.DTOs;

namespace WebAPI.Interfaces
{
    public interface IStaffRepository
    {
        Task<IEnumerable<StaffMemberDTO>> GetStaffAsync(Guid businessId, Guid callerId);
        Task<IEnumerable<BusinessInvitationDTO>> GetPendingInvitationsAsync(Guid businessId, Guid callerId);
        Task CancelInvitationAsync(Guid businessId, Guid invitationId, Guid callerId);
        Task RemoveStaffAsync(Guid businessId, Guid userId, Guid callerId);
        Task<IEnumerable<Guid>> GetStaffServicesAsync(Guid businessId, Guid userId, Guid callerId);
        Task UpdateStaffServicesAsync(Guid businessId, Guid userId, Guid callerId, List<Guid> serviceIds);
        Task<StaffReportDTO> GetStaffReportAsync(Guid businessId, Guid userId, Guid callerId, DateTime? startDate, DateTime? endDate);
        Task<PartnerStatsDTO> GetPartnerStatsAsync(Guid partnerId);
        Task<IEnumerable<InactiveStaffEntryDTO>> GetInactiveStaffAsync(Guid businessId, Guid callerId);
    }
}
