using System.ComponentModel.DataAnnotations;

namespace WebAPI.DTOs
{
    public class CancelAppointmentDTO
    {
        [MaxLength(500, ErrorMessage = "Cancellation reason cannot exceed 500 characters.")]
        public string? CancellationReason { get; set; }
    }
}
