using WebAPI.Models;

namespace WebAPI.DTOs
{
    public class BusinessInvitationDTO
    {
        public Guid Id { get; set; }
        public Guid BusinessId { get; set; }
        public string BusinessName { get; set; } = string.Empty;
        public Guid InviterId { get; set; }
        public Guid? WorkerId { get; set; }
        public string WorkerEmail { get; set; } = string.Empty;
        public InvitationStatus Status { get; set; }
        public string? Message { get; set; }
        public DateTime InvitedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
        public DateTime ExpirationDate { get; set; }
    }
}