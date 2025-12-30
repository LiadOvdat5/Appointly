using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Mappers
{
    public static class ServiceMapper
    {
        public static Service ToService(CreateServiceDTO dto, Guid businessId)
        {
            return new Service
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                UserId = dto.UserId,
                Name = dto.Name,
                Description = dto.Description,
                Duration = dto.Duration,
                Price = dto.Price,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        public static ServiceDTO ToServiceDTO(Service service)
        {
            return new ServiceDTO
            {
                Id = service.Id,
                BusinessId = service.BusinessId,
                UserId = service.UserId,
                Name = service.Name,
                Description = service.Description,
                Duration = service.Duration,
                Price = service.Price,
                CreatedAt = service.CreatedAt,
                UpdatedAt = service.UpdatedAt
            };
        }

        public static void UpdateServiceFromDTO(Service service, UpdateServiceDTO dto)
        {
            if (dto.Name != null)
                service.Name = dto.Name;

            if (dto.Description != null)
                service.Description = dto.Description;

            if (dto.Duration.HasValue)
                service.Duration = dto.Duration.Value;

            if (dto.Price.HasValue)
                service.Price = dto.Price.Value;

            // UserId will be validated externally, only set if provided
            if (dto.UserId.HasValue)
                service.UserId = dto.UserId.Value;

            service.UpdatedAt = DateTime.UtcNow;
        }
    }
}