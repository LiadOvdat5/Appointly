using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface INotificationRepository
    {
        Task AddAsync(Notification notification);
        Task<List<Notification>> GetByUserIdAsync(Guid userId, int page, int pageSize);
        Task<int> GetUnreadCountAsync(Guid userId);
        Task<Notification?> GetByIdAsync(Guid id);
        Task<List<Notification>> GetUnreadByUserIdAsync(Guid userId);
        Task SaveChangesAsync();
    }
}
