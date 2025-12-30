using WebAPI.DTOs;

namespace WebAPI.Interfaces
{
    public interface IServiceRepository
    {
        Task<ServiceDTO> CreateServiceAsync(Guid businessId, Guid ownerId, CreateServiceDTO createServiceDto);
        Task<IEnumerable<ServiceDTO>> GetServicesForBusinessAsync(Guid businessId);
        Task<ServiceDTO> UpdateServiceAsync(Guid serviceId, Guid ownerId, UpdateServiceDTO updateServiceDto);
    }
}