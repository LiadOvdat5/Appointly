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

        [Required(ErrorMessage = "Business name is required.")]
        [MaxLength(100, ErrorMessage = "Business name cannot exceed 100 characters.")]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }
        public string? Address { get; set; }
        [MaxLength(20, ErrorMessage = "Phone number cannot exceed 20 characters.")]
        public string? Phone { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
