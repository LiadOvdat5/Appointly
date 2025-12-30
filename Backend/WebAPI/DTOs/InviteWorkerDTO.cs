using System.ComponentModel.DataAnnotations;

namespace WebAPI.DTOs
{
    public class InviteWorkerDTO
    {
        [Required(ErrorMessage = "Worker email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email address.")]
        [MaxLength(100, ErrorMessage = "Email cannot exceed 100 characters.")]
        public string WorkerEmail { get; set; } = string.Empty;

        [MaxLength(500, ErrorMessage = "Message cannot exceed 500 characters.")]
        public string? Message { get; set; }
    }
}