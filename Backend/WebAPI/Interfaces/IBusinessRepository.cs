using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface IBusinessRepository
    {
        // Define methods for business operations here
        Task<BusinessDTO> CreateBusinessAsync(Guid ownerId, CreateBusinessDTO createBusinessDto);
        Task<BusinessDTO> GetBusinessByIdAsync(Guid id);
        Task<BusinessDTO> GetBusinessBySlugAsync(string slug);
        Task<Business?> GetBusinessEntityByIdAsync(Guid id);
        Task<IEnumerable<BusinessDTO>> GetAllBusinessesAsync(Guid? categoryId = null);
        Task<IEnumerable<BusinessDTO>> GetBusinessesByOwnerAsync(Guid ownerId);
        Task<BusinessDTO> UpdateBusinessAsync(Guid businessId, Guid userId, UpdateBusinessDTO updateBusinessDto);
        Task<BusinessDTO> UpdateBusinessLogoAsync(Guid businessId, Guid userId, string logoUrl);
        Task<BusinessDTO> UpdateBusinessBannerAsync(Guid businessId, Guid userId, string bannerUrl);
        Task<BusinessDTO> UpdateBusinessSearchImageAsync(Guid businessId, Guid userId, string searchImageUrl);
        Task UpdateRatingAsync(Guid businessId, double averageRating, int reviewCount);
        Task SaveChangesAsync();
    }
}