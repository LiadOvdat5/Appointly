using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebAPI.Models
{
    public enum UserRole
    {
        client,
        partner,
        owner,
        admin
    }

    public class User
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "Name is required.")]
        [MaxLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required.")]
        [MaxLength(100, ErrorMessage = "Email cannot exceed 100 characters.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        public string Email { get; set; } = string.Empty;

        [MaxLength(200, ErrorMessage = "Password hash cannot exceed 200 characters.")]
        [Column("PasswordHash")]
        public string? Password { get; set; }

        [MaxLength(255)]
        public string? GoogleId { get; set; }

        [MaxLength(20, ErrorMessage = "Phone number cannot exceed 20 characters.")]
        public string? Phone { get; set; }

        [Required(ErrorMessage = "Role is required.")]
        public UserRole Role { get; set; } = UserRole.client;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool IsSuspended { get; set; } = false;

        [MaxLength(500)]
        public string? SuspendedReason { get; set; }

        [MaxLength(512)]
        public string? PasswordResetToken { get; set; }

        public DateTime? PasswordResetTokenExpiry { get; set; }

        [MaxLength(512)]
        public string? RefreshTokenHash { get; set; }

        public DateTime? RefreshTokenExpiry { get; set; }

        // Tutorial seen-state stored as JSON: { "search": true, "booking": true, ... }
        public string? SeenTutorials { get; set; }

        // ── Push notification preferences (all default ON) ────────────────────
        public bool PushBookingConfirm { get; set; } = true;
        public bool PushCancellations { get; set; } = true;
        public bool PushReminders24h { get; set; } = true;
        public bool PushReminders1h { get; set; } = true;
        public bool PushReviewPrompt { get; set; } = true;
        public bool PushBroadcasts { get; set; } = true;
    }
}
