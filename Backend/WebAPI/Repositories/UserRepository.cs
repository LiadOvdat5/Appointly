using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Models;
using Microsoft.AspNetCore.Identity;

namespace WebAPI.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserDTO?> GetUserByIdAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                throw new Exception("User not found.");

            return new UserDTO
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            };
        }

        public async Task<UserDTO?> UpdateUserAsync(Guid id, UpdateUserDTO updateUserDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                throw new Exception("User not found.");

            if (!string.IsNullOrEmpty(updateUserDto.Name))
            {
                user.Name = updateUserDto.Name;
            }

            if (!string.IsNullOrEmpty(updateUserDto.Email))
            {
                // Check if the new email is already taken by another user
                var emailExists = await _context.Users.AnyAsync(u => u.Email == updateUserDto.Email && u.Id != id);
                if (emailExists)
                    throw new Exception("Email is already in use.");

                user.Email = updateUserDto.Email;
            }


            if (!string.IsNullOrEmpty(updateUserDto.NewPassword))
            {
                if (string.IsNullOrEmpty(updateUserDto.CurrentPassword))
                    throw new ArgumentException("Current password is required to set a new password.");

                var passwordHasher = new PasswordHasher<User>();
                var verifyResult = passwordHasher.VerifyHashedPassword(user, user.Password, updateUserDto.CurrentPassword);
                if (verifyResult == PasswordVerificationResult.Failed)
                    throw new ArgumentException("Current password is incorrect.");

                user.Password = passwordHasher.HashPassword(user, updateUserDto.NewPassword);
            }

            user.UpdatedAt = DateTime.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return new UserDTO
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            };
        }

        public async Task UpdateUserRoleToOwnerAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User not found.");

            user.Role = UserRole.owner;
            user.UpdatedAt = DateTime.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task<Dictionary<string, bool>> GetSeenTutorialsAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User not found.");

            if (string.IsNullOrEmpty(user.SeenTutorials))
                return new Dictionary<string, bool>();

            return JsonSerializer.Deserialize<Dictionary<string, bool>>(user.SeenTutorials)
                   ?? new Dictionary<string, bool>();
        }

        public async Task MarkTutorialSeenAsync(Guid userId, string tutorialKey)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User not found.");

            var seen = string.IsNullOrEmpty(user.SeenTutorials)
                ? new Dictionary<string, bool>()
                : JsonSerializer.Deserialize<Dictionary<string, bool>>(user.SeenTutorials)
                  ?? new Dictionary<string, bool>();

            seen[tutorialKey] = true;
            user.SeenTutorials = JsonSerializer.Serialize(seen);
            user.UpdatedAt = DateTime.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task<PushPreferencesDTO> GetPushPreferencesAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User not found.");

            return new PushPreferencesDTO
            {
                PushBookingConfirm = user.PushBookingConfirm,
                PushCancellations  = user.PushCancellations,
                PushReminders24h   = user.PushReminders24h,
                PushReminders1h    = user.PushReminders1h,
                PushReviewPrompt   = user.PushReviewPrompt,
            };
        }

        public async Task<PushPreferencesDTO> UpdatePushPreferencesAsync(Guid userId, UpdatePushPreferencesDTO dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User not found.");

            if (dto.PushBookingConfirm.HasValue) user.PushBookingConfirm = dto.PushBookingConfirm.Value;
            if (dto.PushCancellations.HasValue)  user.PushCancellations  = dto.PushCancellations.Value;
            if (dto.PushReminders24h.HasValue)   user.PushReminders24h   = dto.PushReminders24h.Value;
            if (dto.PushReminders1h.HasValue)    user.PushReminders1h    = dto.PushReminders1h.Value;
            if (dto.PushReviewPrompt.HasValue)   user.PushReviewPrompt   = dto.PushReviewPrompt.Value;
            user.UpdatedAt = DateTime.UtcNow;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return new PushPreferencesDTO
            {
                PushBookingConfirm = user.PushBookingConfirm,
                PushCancellations  = user.PushCancellations,
                PushReminders24h   = user.PushReminders24h,
                PushReminders1h    = user.PushReminders1h,
                PushReviewPrompt   = user.PushReviewPrompt,
            };
        }
    }
}