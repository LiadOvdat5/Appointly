using System;
using System.Collections.Generic;
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
        Task UpdateUserRoleToClientAsync(Guid userId);
        Task AnonymizeUserAsync(Guid userId);
        Task<Dictionary<string, bool>> GetSeenTutorialsAsync(Guid userId);
        Task MarkTutorialSeenAsync(Guid userId, string tutorialKey);
        Task<PushPreferencesDTO> GetPushPreferencesAsync(Guid userId);
        Task<PushPreferencesDTO> UpdatePushPreferencesAsync(Guid userId, UpdatePushPreferencesDTO dto);
    }
}