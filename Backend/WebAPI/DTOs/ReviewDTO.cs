using System;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.DTOs
{
    public class CreateReviewDTO
    {
        [Required]
        public Guid AppointmentId { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int Rating { get; set; }

        [MaxLength(500, ErrorMessage = "Comment cannot exceed 500 characters.")]
        public string? Comment { get; set; }
    }

    public class ReviewDTO
    {
        public Guid Id { get; set; }
        public Guid BusinessId { get; set; }
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public Guid AppointmentId { get; set; }
        public Guid? ServiceId { get; set; }
        public string? ServiceName { get; set; }
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsFlagged { get; set; }
        public string? FlagReason { get; set; }
    }

    public class FlagReviewDTO
    {
        [Required]
        [MaxLength(500, ErrorMessage = "Reason cannot exceed 500 characters.")]
        public string Reason { get; set; } = string.Empty;
    }
}
