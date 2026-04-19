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

        // Optional: Track which appointment booked this slot
        public Guid? AppointmentId { get; set; }

        /// <summary>
        /// Set when this slot is blocked (Status = BLOCKED) due to a parallel-booking
        /// conflict. Points to the appointment on the sibling service that caused
        /// the block. Cleared when that appointment is cancelled.
        /// </summary>
        public Guid? BlockingAppointmentId { get; set; }

        /// <summary>
        /// Optional note set when an owner or partner manually blocks this slot.
        /// Null for system-generated blocks (parallel-booking conflicts).
        /// </summary>
        [MaxLength(500)]
        public string? BlockNote { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Service? Service { get; set; }
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
