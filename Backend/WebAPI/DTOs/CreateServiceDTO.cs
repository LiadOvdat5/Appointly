using System.ComponentModel.DataAnnotations;

namespace WebAPI.DTOs
{
    public class CreateServiceDTO
    {
        [Required(ErrorMessage = "Service name is required.")]
        [MaxLength(100, ErrorMessage = "Service name cannot exceed 100 characters.")]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required(ErrorMessage = "Duration is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Duration must be greater than 0.")]
        public int Duration { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Price cannot be negative.")]
        public decimal? Price { get; set; }

        [Required(ErrorMessage = "UserId is required.")]
        public Guid UserId { get; set; }

        [Required(ErrorMessage = "CategoryId is required.")]
        public Guid CategoryId { get; set; }
    }
}