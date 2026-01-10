using System;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public class BreakRule
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "ServiceId is required.")]
        public Guid ServiceId { get; set; }

        // Optional: null = applies to all days
        [Range(0, 6, ErrorMessage = "DayOfWeek must be between 0 (Monday) and 6 (Sunday).")]
        public int? DayOfWeek { get; set; }

        [Required(ErrorMessage = "StartTime is required.")]
        public TimeSpan StartTime { get; set; }

        [Required(ErrorMessage = "EndTime is required.")]
        public TimeSpan EndTime { get; set; }

        // Optional: date-bounded breaks
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Service? Service { get; set; }
    }
}
