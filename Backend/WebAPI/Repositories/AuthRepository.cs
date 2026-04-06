using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.DTOs;
using WebAPI.Exceptions;
using WebAPI.Interfaces;
using WebAPI.Models;
using System.Security.Cryptography;
using System.Text;
using WebAPI.Services;
using WebAPI.Mappers;
using Microsoft.AspNetCore.Identity;


namespace WebAPI.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _context;
        private readonly IJwtService _jwtService;

        public AuthRepository(AppDbContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        public async Task<UserDTO> RegisterAsync(RegisterUserDTO registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                throw new Exception("Email already exists.");

            var user = registerDto.ToUser();

            var passwordHasher = new PasswordHasher<User>();
            user.Password = passwordHasher.HashPassword(user, registerDto.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return user.ToUserDTO();
        }

        public async Task<LoginResponseDTO> LoginAsync(LoginDTO loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null)
                throw new Exception("Invalid credentials.");

            // Verify password
            var passwordHasher = new PasswordHasher<User>();
            var result = passwordHasher.VerifyHashedPassword(user, user.Password, loginDto.Password);
            if (result != PasswordVerificationResult.Success)
                throw new Exception("Invalid credentials.");

            // Block suspended accounts
            if (user.IsSuspended)
                throw new SuspendedAccountException(user.SuspendedReason);

            // For partner users, include their associated businessId in the JWT
            Guid? partnerBusinessId = null;
            if (user.Role == UserRole.partner)
            {
                var partnerRecord = await _context.BusinessPartners
                    .FirstOrDefaultAsync(p => p.UserId == user.Id && p.Status == InvitationStatus.Accepted);
                partnerBusinessId = partnerRecord?.BusinessId;
            }

            var tokenResult = _jwtService.GenerateToken(user, partnerBusinessId);

            return new LoginResponseDTO
            {
                Token = tokenResult.Token,
                ExpiresAt = tokenResult.ExpiresAt,
                User = user.ToUserDTO()
            };
        }

        public async Task<bool> LogoutAsync(string userId)
        {
            // In JWT stateless auth, logout is handled on the client by deleting the token.
            // To implement server-side invalidation, store the token in a blacklist (DB/cache) and check it on each request.
            // For now, just return true.
            return true;
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }
    }
}
