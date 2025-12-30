using WebAPI.DTOs;

namespace WebAPI.Interfaces
{
    public interface IBusinessRepository
    {
        // Define methods for business operations here
        Task<BusinessDTO> CreateBusinessAsync(Guid ownerId, CreateBusinessDTO createBusinessDto);
        Task<BusinessDTO> GetBusinessByIdAsync(Guid id);
        Task<IEnumerable<BusinessDTO>> GetAllBusinessesAsync();
        Task<BusinessDTO> UpdateBusinessAsync(Guid businessId, Guid userId, UpdateBusinessDTO updateBusinessDto);
    }
}