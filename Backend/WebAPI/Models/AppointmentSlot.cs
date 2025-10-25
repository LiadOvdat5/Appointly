using System;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.Models
{
    public class AppointmentSlot
    {
        [Key]
        public Guid Id { get; set; }

        [Required(ErrorMessage = "AppointmentId is required.")]
        public Guid AppointmentId { get; set; }

        [Required(ErrorMessage = "SlotId is required.")]
        public Guid SlotId { get; set; }
    }
}
