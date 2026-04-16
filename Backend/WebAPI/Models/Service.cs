using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public class Service
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "BusinessId is required.")]
        public Guid BusinessId { get; set; }

        [Required(ErrorMessage = "UserId is required.")]
        public Guid UserId { get; set; }

        [Required(ErrorMessage = "Service name is required.")]
        [MaxLength(100, ErrorMessage = "Service name cannot exceed 100 characters.")]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required(ErrorMessage = "Duration is required.")]
        public int Duration { get; set; }

        public decimal? Price { get; set; }

        [Required(ErrorMessage = "CategoryId is required.")]
        public Guid CategoryId { get; set; }
        public Category? Category { get; set; }

        /// <summary>
        /// The single staff member assigned to perform this service.
        /// Nullable — null means no one is explicitly assigned.
        /// Replaces the legacy many-to-many BusinessPartner.Services list.
        /// </summary>
        public Guid? AssignedStaffId { get; set; }

        /// <summary>
        /// When true (default), booking this service automatically blocks the same
        /// time slot on all sibling services assigned to the same staff member.
        /// </summary>
        public bool BlockOnBooking { get; set; } = true;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Business? Business { get; set; }
        public User? User { get; set; }
        public User? AssignedStaff { get; set; }
        public ICollection<ServiceSchedule> ServiceSchedules { get; set; } = new List<ServiceSchedule>();
    }
}
