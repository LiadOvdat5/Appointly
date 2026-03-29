using WebAPI.Models;

namespace WebAPI.DTOs
{
    public class UserDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        // Only populated for partner role — the business they belong to
        public Guid? BusinessId { get; set; }
    }
}
