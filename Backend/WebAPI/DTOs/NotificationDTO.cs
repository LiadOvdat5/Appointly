using WebAPI.Models;

namespace WebAPI.DTOs
{
    public class NotificationDTO
    {
        public Guid Id { get; set; }
        /// <summary>i18n key for the notification title</summary>
        public string Title { get; set; } = string.Empty;
        /// <summary>i18n key for the notification body</summary>
        public string Body { get; set; } = string.Empty;
        public NotificationType Type { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? RelatedEntityId { get; set; }
        /// <summary>Frontend route to navigate to when notification is clicked</summary>
        public string? TargetPath { get; set; }
        /// <summary>Key-value pairs for i18n body interpolation (e.g. clientName, serviceName, date)</summary>
        public Dictionary<string, string>? BodyParams { get; set; }
    }
}
