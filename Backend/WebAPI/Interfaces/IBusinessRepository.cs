using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface IBusinessRepository
    {
        // Define methods for business operations here
        Task<BusinessDTO> CreateBusinessAsync(Guid ownerId, CreateBusinessDTO createBusinessDto);
        Task<BusinessDTO> GetBusinessByIdAsync(Guid id);
        Task<Business?> GetBusinessEntityByIdAsync(Guid id);
        Task<IEnumerable<BusinessDTO>> GetAllBusinessesAsync(Guid? categoryId = null);
        Task<IEnumerable<BusinessDTO>> GetBusinessesByOwnerAsync(Guid ownerId);
        Task<BusinessDTO> UpdateBusinessAsync(Guid businessId, Guid userId, UpdateBusinessDTO updateBusinessDto);
    }
}