using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public enum CategoryRequestStatus
    {
        Pending,
        Approved,
        Rejected
    }

    public class CategoryRequest
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid RequestedByUserId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? AiSuggestedName { get; set; }

        [MaxLength(100)]
        public string? AiSuggestedIcon { get; set; }

        [Required]
        public CategoryRequestStatus Status { get; set; } = CategoryRequestStatus.Pending;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public User? RequestedBy { get; set; }
    }
}
