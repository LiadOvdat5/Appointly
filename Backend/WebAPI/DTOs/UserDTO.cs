using WebAPI.Models;

namespace WebAPI.DTOs
{
    public class UserDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        // Owned business — only populated for partner and owner roles
        public Guid? BusinessId { get; set; }
        // Partner workplace — populated when an owner is also a staff member at another business
        public Guid? WorkplaceBusinessId { get; set; }
    }
}
