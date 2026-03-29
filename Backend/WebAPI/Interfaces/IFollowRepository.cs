using WebAPI.DTOs;

namespace WebAPI.Interfaces
{
    public interface IFollowRepository
    {
        Task<FollowDTO> FollowAsync(Guid userId, Guid businessId);
        Task<bool> UnfollowAsync(Guid userId, Guid businessId);
        Task<IEnumerable<BusinessDTO>> GetFollowedBusinessesAsync(Guid userId);
        Task<FollowStatusDTO> GetFollowStatusAsync(Guid userId, Guid businessId);
    }
}
