using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Mappers;
using WebAPI.Models;

namespace WebAPI.Repositories
{
    public class ServiceRepository : IServiceRepository
    {
        private readonly AppDbContext _context;

        public ServiceRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceDTO> CreateServiceAsync(Guid businessId, Guid ownerId, CreateServiceDTO createServiceDto)
        {
            var business = await _context.Businesses
                .Include(b => b.Partners)
                .FirstOrDefaultAsync(b => b.Id == businessId)
                ?? throw new KeyNotFoundException($"Business with ID {businessId} not found.");

            if (business.OwnerId != ownerId)
                throw new UnauthorizedAccessException("Only the business owner can add services.");

            var partnerExists = business.Partners.Any(p => p.UserId == createServiceDto.UserId);
            if (!partnerExists)
                throw new KeyNotFoundException($"User with ID {createServiceDto.UserId} is not a partner of this business.");

            // Validate category exists
            var category = await _context.Categories.FindAsync(createServiceDto.CategoryId);
            if (category == null)
                throw new KeyNotFoundException("Category not found.");

            var service = ServiceMapper.ToService(createServiceDto, businessId);

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

            // Recalculate business categories after adding service
            await RecalculateBusinessCategories(businessId);

            return ServiceMapper.ToServiceDTO(service);
        }

        public async Task<IEnumerable<ServiceDTO>> GetServicesForBusinessAsync(Guid businessId)
        {
            var business = await _context.Businesses.FindAsync(businessId);
            if (business == null)
                throw new KeyNotFoundException($"Business with ID {businessId} not found.");

            var services = await _context.Services
                .Where(s => s.BusinessId == businessId)
                .ToListAsync();

            return services.Select(ServiceMapper.ToServiceDTO).ToList();
        }

        public async Task<ServiceDTO> UpdateServiceAsync(Guid businessId, Guid serviceId, Guid ownerId, UpdateServiceDTO updateServiceDto)
        {
            var service = await _context.Services.FindAsync(serviceId)
                ?? throw new KeyNotFoundException("Service not found.");

            if (service.BusinessId != businessId)
                throw new KeyNotFoundException("Service does not belong to this business.");

            var business = await _context.Businesses
                .Include(b => b.Partners)
                .FirstOrDefaultAsync(b => b.Id == service.BusinessId)
                ?? throw new KeyNotFoundException("Business not found.");

            if (business.OwnerId != ownerId)
                throw new UnauthorizedAccessException("Only the business owner can update services.");

            if (updateServiceDto.UserId.HasValue)
            {
                var partnerExists = business.Partners.Any(p => p.UserId == updateServiceDto.UserId.Value);
                if (!partnerExists)
                    throw new KeyNotFoundException("New user is not a partner of this business.");
            }

            // Validate category if provided
            if (updateServiceDto.CategoryId.HasValue)
            {
                var category = await _context.Categories.FindAsync(updateServiceDto.CategoryId.Value);
                if (category == null)
                    throw new KeyNotFoundException("Category not found.");
            }

            ServiceMapper.UpdateServiceFromDTO(service, updateServiceDto);

            _context.Services.Update(service);
            await _context.SaveChangesAsync();

            // Recalculate business categories after updating service
            await RecalculateBusinessCategories(service.BusinessId);

            return ServiceMapper.ToServiceDTO(service);
        }

        public async Task DeleteServiceAsync(Guid businessId, Guid serviceId, Guid ownerId)
        {
            var service = await _context.Services.FindAsync(serviceId)
                ?? throw new KeyNotFoundException("Service not found.");

            if (service.BusinessId != businessId)
                throw new KeyNotFoundException("Service does not belong to this business.");

            var business = await _context.Businesses
                .FirstOrDefaultAsync(b => b.Id == businessId)
                ?? throw new KeyNotFoundException("Business not found.");

            if (business.OwnerId != ownerId)
                throw new UnauthorizedAccessException("Only the business owner can delete services.");

            _context.Services.Remove(service);
            await _context.SaveChangesAsync();

            // Recalculate business categories after removing service
            await RecalculateBusinessCategories(businessId);
        }

        public async Task<Service?> GetByIdAsync(Guid serviceId)
        {
            return await _context.Services
                .Include(s => s.Business)
                    .ThenInclude(b => b!.Partners)
                .Include(s => s.User)
                .FirstOrDefaultAsync(s => s.Id == serviceId);
        }

        private async Task RecalculateBusinessCategories(Guid businessId)
        {
            var business = await _context.Businesses.FindAsync(businessId);
            if (business == null) return;

            var categoryIds = await _context.Services
                .Where(s => s.BusinessId == businessId && s.CategoryId != Guid.Empty)
                .Select(s => s.CategoryId)
                .Distinct()
                .ToListAsync();

            // Store as string representations to match primitive collection storage
            business.CategoryIds = categoryIds.Select(g => g.ToString()).ToList();
            _context.Businesses.Update(business);
            await _context.SaveChangesAsync();
        }
    }
}