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
using System.Text.Json;


namespace WebAPI.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _context;
        private readonly IJwtService _jwtService;
        private static readonly HttpClient _httpClient = new();

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

            // Google-only account has no password — direct to Google sign-in
            if (user.Password == null)
                throw new Exception("This account uses Google sign-in — please use the Google button to log in.");

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

        public async Task<Guid?> GetPartnerBusinessIdAsync(Guid userId)
        {
            var partnerRecord = await _context.BusinessPartners
                .FirstOrDefaultAsync(p => p.UserId == userId && p.Status == InvitationStatus.Accepted);
            return partnerRecord?.BusinessId;
        }

        public async Task<LoginResponseDTO> GoogleAuthAsync(GoogleAuthDTO dto, string googleClientId)
        {
            // 1. Validate the id_token with Google
            var tokenInfoUrl = $"https://oauth2.googleapis.com/tokeninfo?id_token={dto.IdToken}";
            var response = await _httpClient.GetAsync(tokenInfoUrl);
            if (!response.IsSuccessStatusCode)
                throw new Exception("Invalid Google token.");

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            // Verify the token was issued for this app
            var aud = root.GetProperty("aud").GetString();
            if (aud != googleClientId)
                throw new Exception("Google token audience mismatch.");

            var googleId = root.GetProperty("sub").GetString()
                ?? throw new Exception("Google token missing subject.");
            var email = root.GetProperty("email").GetString()
                ?? throw new Exception("Google token missing email.");
            var name = root.TryGetProperty("name", out var nameProp)
                ? nameProp.GetString() ?? email
                : email;

            // 2. Look up existing user by GoogleId or email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId)
                    ?? await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user != null)
            {
                // Existing credential-registered user (has password, no GoogleId) → block silent merge
                if (user.GoogleId == null)
                    throw new Exception("An account with this email already exists — please log in with your password.");

                if (user.IsSuspended)
                    throw new SuspendedAccountException(user.SuspendedReason);
            }
            else
            {
                // New user — role is required
                if (dto.Role == null)
                    throw new Exception("Role is required for new Google sign-ups.");

                user = new User
                {
                    Id = Guid.NewGuid(),
                    Name = name,
                    Email = email,
                    GoogleId = googleId,
                    Password = null,
                    Role = dto.Role.Value,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            // 3. Issue JWT (same as credential login)
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
    }
}
