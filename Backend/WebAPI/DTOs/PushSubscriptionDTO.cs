using System.ComponentModel.DataAnnotations;

namespace WebAPI.DTOs
{
    public class SavePushSubscriptionDTO
    {
        [Required]
        public string Endpoint { get; set; } = string.Empty;

        [Required]
        public string P256DH { get; set; } = string.Empty;

        [Required]
        public string Auth { get; set; } = string.Empty;

        public string? UserAgent { get; set; }
    }

    public class DeletePushSubscriptionDTO
    {
        [Required]
        public string Endpoint { get; set; } = string.Empty;
    }
}
