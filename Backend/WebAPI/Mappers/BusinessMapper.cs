using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Mappers
{
    public static class BusinessMapper
    {
        public static Business ToBusiness(Guid ownerId, CreateBusinessDTO createBusinessDto)
        {
            return new Business
            {
                Id = Guid.NewGuid(),
                OwnerId = ownerId,
                Name = createBusinessDto.Name,
                Address = createBusinessDto.Address,
                Phone = createBusinessDto.Phone,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        public static BusinessDTO ToBusinessDTO(Business business)
        {
            return new BusinessDTO
            {
                Id = business.Id,
                Name = business.Name,
                Address = business.Address ?? string.Empty,
                Phone = business.Phone ?? string.Empty
            };
        }

        public static void UpdateBusinessFromDTO(Business business, UpdateBusinessDTO updateDto)
        {
            if (!string.IsNullOrEmpty(updateDto.Name))
                business.Name = updateDto.Name;

            if (updateDto.Address != null)
                business.Address = updateDto.Address;

            if (updateDto.Phone != null)
                business.Phone = updateDto.Phone;

            if (updateDto.Description != null)
                business.Description = updateDto.Description;

            business.UpdatedAt = DateTime.UtcNow;
        }
    }
}