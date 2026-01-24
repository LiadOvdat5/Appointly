using System.Threading.Tasks;
using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface IAuthRepository
    {
        Task<UserDTO?> RegisterAsync(RegisterUserDTO registerDto);
        Task<LoginResponseDTO?> LoginAsync(LoginDTO loginDto);
        Task<bool> LogoutAsync(string userId);
        Task<User?> GetUserByEmailAsync(string email);

    }
}
