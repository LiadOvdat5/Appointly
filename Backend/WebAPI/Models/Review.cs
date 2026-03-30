using System;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public class Review
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid BusinessId { get; set; }

        [Required]
        public Guid CustomerId { get; set; }

        [Required]
        public Guid AppointmentId { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5.")]
        public int Rating { get; set; }

        [MaxLength(500, ErrorMessage = "Comment cannot exceed 500 characters.")]
        public string? Comment { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsFlagged { get; set; } = false;

        [MaxLength(500)]
        public string? FlagReason { get; set; }

        // Navigation properties
        public Business? Business { get; set; }
        public User? Customer { get; set; }
        public Appointment? Appointment { get; set; }
    }
}
