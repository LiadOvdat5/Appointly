using System;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public class DateException
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "ServiceId is required.")]
        public Guid ServiceId { get; set; }

        [Required(ErrorMessage = "Date is required.")]
        public DateTime Date { get; set; }

        [Required(ErrorMessage = "IsWorkingDay is required.")]
        public bool IsWorkingDay { get; set; }

        // Nullable if not a working day
        public TimeSpan? StartTime { get; set; }

        public TimeSpan? EndTime { get; set; }

        [MaxLength(255)]
        public string? Reason { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public Service? Service { get; set; }
    }
}
