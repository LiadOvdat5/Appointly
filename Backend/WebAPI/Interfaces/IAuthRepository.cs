using System.Threading.Tasks;
using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface IAuthRepository
    {
        Task<UserDTO?> RegisterAsync(RegisterUserDTO registerDto);
        Task<string?> LoginAsync(LoginDTO loginDto);
        Task<bool> LogoutAsync(string userId);
        Task<User?> GetUserByEmailAsync(string email);
        
    }
}
