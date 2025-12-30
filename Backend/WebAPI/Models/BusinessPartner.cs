using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public class BusinessPartner
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "BusinessId is required.")]
        public Guid BusinessId { get; set; }

        [Required(ErrorMessage = "UserId is required.")]
        public Guid UserId { get; set; }

        [Required(ErrorMessage = "Status is required.")]
        public InvitationStatus Status { get; set; } = InvitationStatus.Pending;

        public Guid? InvitationId { get; set; }

        public List<Guid> Services { get; set; } = new();
        public List<Guid> Schedules { get; set; } = new();

        [Required]
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
