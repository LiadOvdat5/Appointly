using System.Text.Json;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;

        public NotificationService(INotificationRepository notificationRepository)
        {
            _notificationRepository = notificationRepository;
        }

        public async Task CreateNotificationAsync(
            Guid userId,
            string titleKey,
            string bodyKey,
            NotificationType type,
            Guid? relatedEntityId = null,
            string? targetPath = null,
            Dictionary<string, string>? bodyParams = null)
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = titleKey,
                Body = bodyKey,
                Type = type,
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                RelatedEntityId = relatedEntityId,
                TargetPath = targetPath,
                BodyParams = bodyParams != null
                    ? JsonSerializer.Serialize(bodyParams)
                    : null
            };

            await _notificationRepository.AddAsync(notification);
            await _notificationRepository.SaveChangesAsync();
        }

        public async Task<List<NotificationDTO>> GetNotificationsForUserAsync(Guid userId, int page, int pageSize)
        {
            var notifications = await _notificationRepository.GetByUserIdAsync(userId, page, pageSize);
            return notifications.Select(ToDTO).ToList();
        }

        public async Task<int> GetUnreadCountAsync(Guid userId)
        {
            return await _notificationRepository.GetUnreadCountAsync(userId);
        }

        public async Task MarkAsReadAsync(Guid notificationId, Guid userId)
        {
            var notification = await _notificationRepository.GetByIdAsync(notificationId);

            // Not found or belongs to another user — silently ignore (idempotent)
            if (notification == null || notification.UserId != userId)
                return;

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                await _notificationRepository.SaveChangesAsync();
            }
        }

        public async Task MarkAllAsReadAsync(Guid userId)
        {
            var unread = await _notificationRepository.GetUnreadByUserIdAsync(userId);
            if (unread.Count == 0) return;

            foreach (var n in unread)
                n.IsRead = true;

            await _notificationRepository.SaveChangesAsync();
        }

        private static NotificationDTO ToDTO(Notification n) => new()
        {
            Id = n.Id,
            Title = n.Title,
            Body = n.Body,
            Type = n.Type,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt,
            RelatedEntityId = n.RelatedEntityId,
            TargetPath = n.TargetPath,
            BodyParams = n.BodyParams != null
                ? JsonSerializer.Deserialize<Dictionary<string, string>>(n.BodyParams)
                : null
        };
    }
}
