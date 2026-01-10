using System;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public class RecurringRule
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "ServiceId is required.")]
        public Guid ServiceId { get; set; }

        [Required(ErrorMessage = "StartDate is required.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "EndDate is required.")]
        public DateTime EndDate { get; set; }

        [Required(ErrorMessage = "DaysOfWeek is required.")]
        public string DaysOfWeek { get; set; } = string.Empty; // JSON: [0,1,2,3,4] for Mon-Fri

        [Required(ErrorMessage = "StartTime is required.")]
        public TimeSpan StartTime { get; set; }

        [Required(ErrorMessage = "EndTime is required.")]
        public TimeSpan EndTime { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Service? Service { get; set; }
    }
}
