using WebAPI.DTOs;

namespace WebAPI.Interfaces
{
    public interface IBroadcastService
    {
        /// <summary>
        /// Saves a broadcast, enqueues the fan-out job, and returns immediately (202).
        /// Throws InvalidOperationException with code "rate_limited" if the daily quota is exceeded.
        /// </summary>
        Task<BroadcastDTO> SendAsync(Guid businessId, CreateBroadcastDTO dto);

        Task<(List<BroadcastDTO> Items, int Total)> GetHistoryAsync(Guid businessId, int page, int pageSize);

        Task<BroadcastStatusDTO> GetStatusAsync(Guid businessId);
    }
}
