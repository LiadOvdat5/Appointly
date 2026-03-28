using WebAPI.DTOs;

namespace WebAPI.Interfaces
{
    public interface IReportService
    {
        Task<BusinessReportDTO> GetBusinessReportAsync(Guid businessId, Guid requestingUserId, DateTime startDate, DateTime endDate);
    }
}
