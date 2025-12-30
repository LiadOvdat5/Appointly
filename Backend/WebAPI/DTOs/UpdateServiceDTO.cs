using System.ComponentModel.DataAnnotations;

namespace WebAPI.DTOs
{
    public class UpdateServiceDTO
    {
        [MaxLength(100, ErrorMessage = "Service name cannot exceed 100 characters.")]
        public string? Name { get; set; }

        public string? Description { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Duration must be greater than 0.")]
        public int? Duration { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Price cannot be negative.")]
        public decimal? Price { get; set; }

        public Guid? UserId { get; set; }
    }
}