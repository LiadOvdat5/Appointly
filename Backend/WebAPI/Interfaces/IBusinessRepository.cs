using WebAPI.DTOs;

namespace WebAPI.Interfaces
{
    public interface IBusinessRepository
    {
        // Define methods for business operations here
        Task<BusinessDTO> CreateBusinessAsync(Guid ownerId, CreateBusinessDTO createBusinessDto);
    }
}