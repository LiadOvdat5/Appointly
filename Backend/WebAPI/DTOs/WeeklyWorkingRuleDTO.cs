using System;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.DTOs
{
    public class WeeklyWorkingRuleDTO
    {
        public Guid Id { get; set; }
        public Guid ServiceId { get; set; }
        public int DayOfWeek { get; set; }
        public bool IsWorkingDay { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateWeeklyWorkingRuleDTO
    {
        [Required(ErrorMessage = "ServiceId is required.")]
        public Guid ServiceId { get; set; }

        [Required(ErrorMessage = "DayOfWeek is required.")]
        [Range(0, 6, ErrorMessage = "DayOfWeek must be between 0 (Monday) and 6 (Sunday).")]
        public int DayOfWeek { get; set; }

        [Required(ErrorMessage = "IsWorkingDay is required.")]
        public bool IsWorkingDay { get; set; }

        [Required(ErrorMessage = "StartTime is required.")]
        public TimeSpan StartTime { get; set; }

        [Required(ErrorMessage = "EndTime is required.")]
        public TimeSpan EndTime { get; set; }
    }

    public class UpdateWeeklyWorkingRuleDTO
    {
        [Range(0, 6, ErrorMessage = "DayOfWeek must be between 0 (Monday) and 6 (Sunday).")]
        public int? DayOfWeek { get; set; }

        public bool? IsWorkingDay { get; set; }

        public TimeSpan? StartTime { get; set; }

        public TimeSpan? EndTime { get; set; }
    }
}
