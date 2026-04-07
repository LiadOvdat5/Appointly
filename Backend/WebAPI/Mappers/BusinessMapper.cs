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
                Latitude = createBusinessDto.Latitude,
                Longitude = createBusinessDto.Longitude,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        public static BusinessDTO ToBusinessDTO(Business business, IEnumerable<CategoryDTO>? categories = null)
        {
            return new BusinessDTO
            {
                Id = business.Id,
                OwnerId = business.OwnerId,
                Slug = business.Slug,
                Name = business.Name,
                Description = business.Description,
                Address = business.Address ?? string.Empty,
                Phone = business.Phone ?? string.Empty,
                ThemeColor = business.ThemeColor,
                LogoUrl = business.LogoUrl,
                BannerUrl = business.BannerUrl,
                SearchImageUrl = business.SearchImageUrl,
                Latitude = business.Latitude,
                Longitude = business.Longitude,
                Categories = categories?.ToList() ?? new List<CategoryDTO>(),
                AverageRating = business.AverageRating > 0 ? business.AverageRating : null,
                ReviewCount = business.ReviewCount,
                NotifyOnNewBooking = business.NotifyOnNewBooking,
                NotifyOnCancellation = business.NotifyOnCancellation,
                IsSuspended = business.IsSuspended,
                SuspendedReason = business.SuspendedReason
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

            if (updateDto.ThemeColor != null)
                business.ThemeColor = updateDto.ThemeColor;

            if (updateDto.Latitude.HasValue)
                business.Latitude = updateDto.Latitude;

            if (updateDto.Longitude.HasValue)
                business.Longitude = updateDto.Longitude;

            business.UpdatedAt = DateTime.UtcNow;
        }
    }
}