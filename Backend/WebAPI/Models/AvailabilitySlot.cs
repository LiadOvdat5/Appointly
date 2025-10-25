using System;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public enum SlotStatus
    {
        open,
        booked,
        blocked
    }

    public class AvailabilitySlot
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "BusinessId is required.")]
        public Guid BusinessId { get; set; }

        public Guid? PartnerId { get; set; }

        [Required(ErrorMessage = "StartTime is required.")]
        public DateTime StartTime { get; set; }

        [Required(ErrorMessage = "EndTime is required.")]
        public DateTime EndTime { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        public SlotStatus Status { get; set; } = SlotStatus.open;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
