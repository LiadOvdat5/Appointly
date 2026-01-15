using System;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public enum AppointmentStatus
    {
        scheduled,
        canceled,
        completed
    }

    public class Appointment
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "ClientId is required.")]
        public Guid ClientId { get; set; }

        [Required(ErrorMessage = "ServiceId is required.")]
        public Guid ServiceId { get; set; }

        [Required(ErrorMessage = "BusinessId is required.")]
        public Guid BusinessId { get; set; }

        [Required(ErrorMessage = "PartnerId is required.")]
        public Guid PartnerId { get; set; }

        [Required(ErrorMessage = "ServiceScheduleId is required.")]
        public Guid ServiceScheduleId { get; set; }

        [Required(ErrorMessage = "StartDateTime is required.")]
        public DateTime StartDateTime { get; set; }

        [Required(ErrorMessage = "EndDateTime is required.")]
        public DateTime EndDateTime { get; set; }

        [MaxLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters.")]
        public string? Notes { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        public AppointmentStatus Status { get; set; } = AppointmentStatus.scheduled;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Service? Service { get; set; }
        public User? Client { get; set; }
        public User? Partner { get; set; }
        public Business? Business { get; set; }
        public ServiceSchedule? ServiceSchedule { get; set; }
    }
}
