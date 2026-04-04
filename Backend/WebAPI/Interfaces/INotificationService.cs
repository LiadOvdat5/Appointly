using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface INotificationService
    {
        Task CreateNotificationAsync(
            Guid userId,
            string titleKey,
            string bodyKey,
            NotificationType type,
            Guid? relatedEntityId = null,
            string? targetPath = null,
            Dictionary<string, string>? bodyParams = null);

        Task<List<NotificationDTO>> GetNotificationsForUserAsync(Guid userId, int page, int pageSize);
        Task<int> GetUnreadCountAsync(Guid userId);
        Task MarkAsReadAsync(Guid notificationId, Guid userId);
        Task MarkAllAsReadAsync(Guid userId);
    }
}
