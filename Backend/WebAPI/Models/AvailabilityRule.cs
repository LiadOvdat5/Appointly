using System;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace WebAPI.Models
{
    public enum RepeatType
    {
        none,
        weekly,
        monthly
    }

    public class AvailabilityRule
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "BusinessId is required.")]
        public Guid BusinessId { get; set; }

        public Guid? PartnerId { get; set; }

        [Required(ErrorMessage = "FromDate is required.")]
        public DateTime FromDate { get; set; }

        [Required(ErrorMessage = "ToDate is required.")]
        public DateTime ToDate { get; set; }

        [Required(ErrorMessage = "StartTime is required.")]
        public TimeSpan StartTime { get; set; }

        [Required(ErrorMessage = "EndTime is required.")]
        public TimeSpan EndTime { get; set; }

        [Required(ErrorMessage = "DaysOfWeek is required.")]
        public List<int> DaysOfWeek { get; set; } = new();

        public RepeatType? RepeatType { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
