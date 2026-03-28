using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public class Business
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "OwnerId is required.")]
        public Guid OwnerId { get; set; }

        public List<BusinessPartner> Partners { get; set; } = new();
        public List<Guid> ServiceIds { get; set; } = new();
        // Derived Category IDs aggregated from current services (maintained by Service repository)
        public List<string> CategoryIds { get; set; } = new();

        [Required(ErrorMessage = "Business name is required.")]
        [MaxLength(100, ErrorMessage = "Business name cannot exceed 100 characters.")]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string? Address { get; set; }
        [MaxLength(20, ErrorMessage = "Phone number cannot exceed 20 characters.")]
        public string? Phone { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        [MaxLength(20)]
        public string? ThemeColor { get; set; }
        public string? LogoUrl { get; set; }
        public string? BannerUrl { get; set; }
        public string? SearchImageUrl { get; set; }

        // Schedule settings
        [Required]
        [MaxLength(100)]
        public string Timezone { get; set; } = "UTC";

        [Required]
        [Range(1, 365, ErrorMessage = "AdvanceBookingDays must be between 1 and 365.")]
        public int AdvanceBookingDays { get; set; } = 90;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
