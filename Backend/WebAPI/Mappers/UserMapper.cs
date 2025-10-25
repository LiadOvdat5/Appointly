using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Mappers
{
    public static class UserMapper
    {
        public static User ToUser(this RegisterUserDTO dto)
        {
            return new User
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Email = dto.Email,
                Password = string.Empty, // Set password hash separately
                Role = UserRole.client,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        public static UserDTO ToUserDTO(this User user)
        {
            return new UserDTO
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            };
        }
    }
}
