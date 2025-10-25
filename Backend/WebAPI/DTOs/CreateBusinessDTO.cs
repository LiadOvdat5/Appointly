using System.ComponentModel.DataAnnotations;

namespace WebAPI.DTOs
{
    public class CreateBusinessDTO
    {
        [Required(ErrorMessage = "Business name is required.")]
        [MaxLength(100, ErrorMessage = "Business name cannot exceed 100 characters.")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Address is required.")]
        public string Address { get; set; } = string.Empty;

        [Required(ErrorMessage = "Phone number is required.")]
        [MaxLength(20, ErrorMessage = "Phone number cannot exceed 20 characters.")]
        public string Phone { get; set; } = string.Empty;

        public string? Description { get; set; }
    }
}