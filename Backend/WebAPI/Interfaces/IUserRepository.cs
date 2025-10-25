using System;
using System.Threading.Tasks;
using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface IUserRepository
    {
        Task<UserDTO?> GetUserByIdAsync(Guid id);
        Task<UserDTO?> UpdateUserAsync(Guid id, UpdateUserDTO updateUserDto);
        Task UpdateUserRoleToOwnerAsync(Guid userId);
    }
}