using System;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.DTOs
{
    public class CreateAppointmentDTO
    {
        [Required(ErrorMessage = "ServiceId is required.")]
        public Guid ServiceId { get; set; }

        [Required(ErrorMessage = "ServiceScheduleId is required.")]
        public Guid ServiceScheduleId { get; set; }

        [MaxLength(1000, ErrorMessage = "Notes cannot exceed 1000 characters.")]
        public string? Notes { get; set; }
    }
}
