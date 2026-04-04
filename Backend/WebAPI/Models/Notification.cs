using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebAPI.Models
{
    public enum NotificationType
    {
        AppointmentBooked,
        AppointmentCancelled,
        AppointmentReminder,
        ReviewPrompt,
        InvitationReceived
    }

    public class Notification
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string Body { get; set; } = string.Empty;

        [Required]
        public NotificationType Type { get; set; }

        public bool IsRead { get; set; } = false;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Optional reference to a related entity (e.g. AppointmentId, InvitationId)
        /// </summary>
        public Guid? RelatedEntityId { get; set; }

        /// <summary>
        /// Frontend navigation path to open when the notification is clicked (e.g. "/customer-dashboard").
        /// </summary>
        [MaxLength(500)]
        public string? TargetPath { get; set; }

        /// <summary>
        /// JSON-serialized interpolation params for the i18n body key
        /// (e.g. {"clientName":"John","serviceName":"Haircut","date":"Jan 5, 2:00 PM"}).
        /// </summary>
        [MaxLength(1000)]
        public string? BodyParams { get; set; }
    }
}
