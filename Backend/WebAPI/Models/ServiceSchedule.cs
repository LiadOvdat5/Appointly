using System;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public enum ScheduleStatus
    {
        AVAILABLE = 0,
        BOOKED = 1,
        BLOCKED = 2
    }

    public class ServiceSchedule
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "ServiceId is required.")]
        public Guid ServiceId { get; set; }

        [Required(ErrorMessage = "StartDateTime is required.")]
        public DateTime StartDateTime { get; set; }

        [Required(ErrorMessage = "EndDateTime is required.")]
        public DateTime EndDateTime { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        public ScheduleStatus Status { get; set; } = ScheduleStatus.AVAILABLE;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Service? Service { get; set; }
    }
}
