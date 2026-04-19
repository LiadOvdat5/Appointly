using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface IBroadcastRepository
    {
        Task AddAsync(Broadcast broadcast);
        Task SaveChangesAsync();
        /// <summary>Count of broadcasts sent by this business in the last 24 hours.</summary>
        Task<int> GetRecentCountAsync(Guid businessId, TimeSpan window);
        /// <summary>UTC time of the oldest broadcast within the window (for reset-time calculation).</summary>
        Task<DateTime?> GetOldestInWindowAsync(Guid businessId, TimeSpan window);
        Task<List<Broadcast>> GetPagedAsync(Guid businessId, int page, int pageSize);
        Task<int> GetTotalCountAsync(Guid businessId);
    }
}
