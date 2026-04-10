using System.ComponentModel.DataAnnotations;
using WebAPI.Models;

namespace WebAPI.DTOs
{
    public class GoogleAuthDTO
    {
        [Required]
        public string IdToken { get; set; } = string.Empty;

        // Required only on first sign-up; omitted on subsequent logins
        public UserRole? Role { get; set; }
    }
}
