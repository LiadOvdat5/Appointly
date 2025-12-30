using System.ComponentModel.DataAnnotations;

namespace WebAPI.DTOs
{
    public class RespondToInvitationDTO
    {
        [Required]
        public Guid InvitationId { get; set; }

        [Required]
        public bool Accept { get; set; }
    }
}