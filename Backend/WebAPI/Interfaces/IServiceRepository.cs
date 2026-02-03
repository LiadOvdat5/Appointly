using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface IServiceRepository
    {
        Task<ServiceDTO> CreateServiceAsync(Guid businessId, Guid ownerId, CreateServiceDTO createServiceDto);
        Task<IEnumerable<ServiceDTO>> GetServicesForBusinessAsync(Guid businessId);
        Task<ServiceDTO> UpdateServiceAsync(Guid businessId, Guid serviceId, Guid ownerId, UpdateServiceDTO updateServiceDto);
        Task DeleteServiceAsync(Guid businessId, Guid serviceId, Guid ownerId);
        Task<Service?> GetByIdAsync(Guid serviceId);
    }
}