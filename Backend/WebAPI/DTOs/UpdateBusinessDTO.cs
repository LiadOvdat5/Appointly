using System.ComponentModel.DataAnnotations;

namespace WebAPI.DTOs
{
    public class UpdateBusinessDTO
    {
        [MaxLength(100, ErrorMessage = "Business name cannot exceed 100 characters.")]
        public string? Name { get; set; }

        public string? Address { get; set; }

        [MaxLength(20, ErrorMessage = "Phone number cannot exceed 20 characters.")]
        public string? Phone { get; set; }

        public string? Description { get; set; }

        [MaxLength(20, ErrorMessage = "Theme color cannot exceed 20 characters.")]
        public string? ThemeColor { get; set; }

        [MaxLength(3)]
        public string? Currency { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }
}