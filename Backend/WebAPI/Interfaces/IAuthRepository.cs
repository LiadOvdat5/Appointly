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
        Task<Guid?> GetPartnerBusinessIdAsync(Guid userId);
        Task<LoginResponseDTO> GoogleAuthAsync(GoogleAuthDTO dto, string googleClientId);
        Task ForgotPasswordAsync(string email, string frontendBaseUrl);
        Task ResetPasswordAsync(string token, string newPassword);
    }
}
