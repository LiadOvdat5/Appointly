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
using WebAPI.Interfaces;
using Microsoft.AspNetCore.Identity;
using System.Text.Json;


namespace WebAPI.Repositories
{
    public class AuthRepository : IAuthRepository
    {
        private readonly AppDbContext _context;
        private readonly IJwtService _jwtService;
        private readonly IEmailService _emailService;
        private readonly IBusinessInvitationRepository _invitationRepository;
        private static readonly HttpClient _httpClient = new();

        public AuthRepository(AppDbContext context, IJwtService jwtService, IEmailService emailService, IBusinessInvitationRepository invitationRepository)
        {
            _context = context;
            _jwtService = jwtService;
            _emailService = emailService;
            _invitationRepository = invitationRepository;
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

            // If the user registered via an invite link, auto-accept the invitation
            if (!string.IsNullOrWhiteSpace(registerDto.InviteToken))
            {
                try
                {
                    await _invitationRepository.AutoAcceptInvitationAsync(registerDto.InviteToken, user.Id);
                    // Reload user so the updated role (partner) is reflected in the returned DTO
                    await _context.Entry(user).ReloadAsync();
                }
                catch (Exception ex)
                {
                    // Non-fatal — user is registered, invitation accept failed (e.g., expired or invalid token)
                    Console.Error.WriteLine($"[AuthRepository] Auto-accept invitation failed: {ex.Message}");
                }
            }

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

            var response = BuildLoginResponse(user, _jwtService, partnerBusinessId);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return response;
        }

        // ── Refresh token helpers ──────────────────────────────────────────────

        private static (string raw, string hash) GenerateRefreshToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(64);
            var raw = Convert.ToBase64String(bytes)
                .Replace("+", "-").Replace("/", "_").Replace("=", "");
            var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(raw));
            var hash = Convert.ToHexString(hashBytes).ToLowerInvariant();
            return (raw, hash);
        }

        private static LoginResponseDTO BuildLoginResponse(User user, IJwtService jwtService, Guid? partnerBusinessId)
        {
            var tokenResult = jwtService.GenerateToken(user, partnerBusinessId);
            var (rawRefresh, hashRefresh) = GenerateRefreshToken();
            var refreshExpiry = DateTime.UtcNow.AddDays(30);

            user.RefreshTokenHash = hashRefresh;
            user.RefreshTokenExpiry = refreshExpiry;

            var userDto = user.ToUserDTO();
            userDto.BusinessId = partnerBusinessId;

            return new LoginResponseDTO
            {
                Token = tokenResult.Token,
                ExpiresAt = tokenResult.ExpiresAt,
                User = userDto,
                RefreshToken = rawRefresh,
                RefreshTokenExpiry = refreshExpiry
            };
        }

        public async Task<LoginResponseDTO> RefreshAsync(string refreshToken)
        {
            var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(refreshToken));
            var tokenHash = Convert.ToHexString(hashBytes).ToLowerInvariant();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshTokenHash == tokenHash);
            if (user == null || user.RefreshTokenExpiry == null || user.RefreshTokenExpiry < DateTime.UtcNow)
                throw new UnauthorizedAccessException("Refresh token is invalid or expired.");

            if (user.IsSuspended)
                throw new SuspendedAccountException(user.SuspendedReason);

            Guid? partnerBusinessId = null;
            if (user.Role == UserRole.partner)
            {
                var partnerRecord = await _context.BusinessPartners
                    .FirstOrDefaultAsync(p => p.UserId == user.Id && p.Status == InvitationStatus.Accepted);
                partnerBusinessId = partnerRecord?.BusinessId;
            }

            var response = BuildLoginResponse(user, _jwtService, partnerBusinessId);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return response;
        }

        public async Task RevokeRefreshTokenAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return;

            user.RefreshTokenHash = null;
            user.RefreshTokenExpiry = null;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
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

            // 3. Issue JWT + refresh token (same as credential login)
            Guid? partnerBusinessId = null;
            if (user.Role == UserRole.partner)
            {
                var partnerRecord = await _context.BusinessPartners
                    .FirstOrDefaultAsync(p => p.UserId == user.Id && p.Status == InvitationStatus.Accepted);
                partnerBusinessId = partnerRecord?.BusinessId;
            }

            var loginResponse = BuildLoginResponse(user, _jwtService, partnerBusinessId);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return loginResponse;
        }

        public async Task ForgotPasswordAsync(string email, string frontendBaseUrl)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            // Always return silently — do not reveal whether the email exists
            if (user == null || user.GoogleId != null)
                return;

            // Generate a cryptographically random token (raw = sent in email, hash = stored in DB)
            var rawTokenBytes = RandomNumberGenerator.GetBytes(64);
            var rawToken = Convert.ToBase64String(rawTokenBytes)
                .Replace("+", "-").Replace("/", "_").Replace("=", ""); // URL-safe Base64

            var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
            var tokenHash = Convert.ToHexString(hashBytes).ToLowerInvariant();

            user.PasswordResetToken = tokenHash;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var resetLink = $"{frontendBaseUrl}/reset-password?token={Uri.EscapeDataString(rawToken)}";
            var subject = "Reset your BizSlot password";
            var body = $"""
                <p>Hi {user.Name},</p>
                <p>We received a request to reset your BizSlot password.</p>
                <p><a href="{resetLink}">Click here to reset your password</a></p>
                <p>This link expires in 1 hour. If you didn't request a reset, you can safely ignore this email.</p>
                <p>— The BizSlot Team</p>
                """;

            await _emailService.SendEmailAsync(email, subject, body);
        }

        public async Task ResetPasswordAsync(string token, string newPassword)
        {
            var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            var tokenHash = Convert.ToHexString(hashBytes).ToLowerInvariant();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.PasswordResetToken == tokenHash);
            if (user == null)
                throw new Exception("Invalid or expired reset link.");

            if (user.PasswordResetTokenExpiry == null || user.PasswordResetTokenExpiry < DateTime.UtcNow)
                throw new Exception("This reset link has expired. Please request a new one.");

            var passwordHasher = new PasswordHasher<User>();
            user.Password = passwordHasher.HashPassword(user, newPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
    }
}
