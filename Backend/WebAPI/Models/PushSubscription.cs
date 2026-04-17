using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public class PushSubscription
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(600)]
        public string Endpoint { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string P256DH { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Auth { get; set; } = string.Empty;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(300)]
        public string? UserAgent { get; set; }

        // Navigation
        public User? User { get; set; }
    }
}
