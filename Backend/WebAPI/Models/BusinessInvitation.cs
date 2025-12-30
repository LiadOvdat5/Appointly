using System;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public class BusinessInvitation
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "BusinessId is required.")]
        public Guid BusinessId { get; set; }

        [Required(ErrorMessage = "InviterId is required.")]
        public Guid InviterId { get; set; }

        [Required(ErrorMessage = "Worker email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        [MaxLength(100, ErrorMessage = "Email cannot exceed 100 characters.")]
        public string WorkerEmail { get; set; } = string.Empty;

        public Guid? WorkerId { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        public InvitationStatus Status { get; set; } = InvitationStatus.Pending;

        [MaxLength(500, ErrorMessage = "Message cannot exceed 500 characters.")]
        public string? Message { get; set; }

        [Required]
        public DateTime InvitedAt { get; set; } = DateTime.UtcNow;

        public DateTime? RespondedAt { get; set; }

        [Required]
        public DateTime ExpirationDate { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}