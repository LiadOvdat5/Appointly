using System;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.DTOs
{
    public class DateExceptionDTO
    {
        public Guid Id { get; set; }
        public Guid ServiceId { get; set; }
        public DateTime Date { get; set; }
        public bool IsWorkingDay { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateDateExceptionDTO
    {
        [Required(ErrorMessage = "ServiceId is required.")]
        public Guid ServiceId { get; set; }

        [Required(ErrorMessage = "Date is required.")]
        public DateTime Date { get; set; }

        [Required(ErrorMessage = "IsWorkingDay is required.")]
        public bool IsWorkingDay { get; set; }

        public TimeSpan? StartTime { get; set; }

        public TimeSpan? EndTime { get; set; }
    }

    public class UpdateDateExceptionDTO
    {
        public DateTime? Date { get; set; }
        public bool? IsWorkingDay { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
    }
}
