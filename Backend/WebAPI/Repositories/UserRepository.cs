using System;
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


            if (!string.IsNullOrEmpty(updateUserDto.Password))
            {
                var passwordHasher = new PasswordHasher<User>();
                user.Password = passwordHasher.HashPassword(user, updateUserDto.Password);
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
    }
}