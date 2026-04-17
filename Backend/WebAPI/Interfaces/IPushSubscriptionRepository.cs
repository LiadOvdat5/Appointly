using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface IPushSubscriptionRepository
    {
        Task<PushSubscription?> GetByEndpointAsync(string endpoint);
        Task<List<PushSubscription>> GetByUserIdAsync(Guid userId);
        Task AddAsync(PushSubscription subscription);
        Task DeleteAsync(PushSubscription subscription);
        Task SaveChangesAsync();
    }
}
