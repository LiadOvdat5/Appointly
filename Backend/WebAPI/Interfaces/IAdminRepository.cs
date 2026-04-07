using WebAPI.DTOs;

namespace WebAPI.Interfaces
{
    public interface IAdminRepository
    {
        // ── Users ──────────────────────────────────────────────────────────────
        Task<AdminUsersPageDTO> GetUsersPagedAsync(string? search, string? role, int page, int pageSize);
        Task SuspendUserAsync(Guid userId, string? reason);
        Task ReactivateUserAsync(Guid userId);

        // ── Platform Stats ────────────────────────────────────────────────────
        Task<object> GetStatsAsync();

        // ── Flagged Reviews ───────────────────────────────────────────────────
        Task<IEnumerable<AdminFlaggedReviewDTO>> GetFlaggedReviewsAsync();
        Task ResolveReviewAsync(Guid reviewId, string action, Guid? adminId);

        // ── Businesses ────────────────────────────────────────────────────────
        Task<AdminBusinessesPageDTO> GetBusinessesPagedAsync(string? search, int page, int pageSize);
        Task SuspendBusinessAsync(Guid businessId, string? reason);
        Task ReactivateBusinessAsync(Guid businessId);

        // ── Analytics ─────────────────────────────────────────────────────────
        Task<object> GetAppointmentAnalyticsAsync();
        Task<object> GetReviewAnalyticsAsync();

        // ── Category Requests ─────────────────────────────────────────────────
        Task<IEnumerable<AdminCategoryRequestDTO>> GetPendingCategoryRequestsAsync();
        Task<(Guid CategoryId, string CategoryName)> ApproveCategoryRequestAsync(Guid id, string? categoryName, string? iconName);
        Task RejectCategoryRequestAsync(Guid id);
    }
}
