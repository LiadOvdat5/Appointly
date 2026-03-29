using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public class Follow
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        [Required]
        public Guid BusinessId { get; set; }
        public Business Business { get; set; } = null!;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
