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

            var service = ServiceMapper.ToService(createServiceDto, businessId);

            _context.Services.Add(service);
            await _context.SaveChangesAsync();

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

            ServiceMapper.UpdateServiceFromDTO(service, updateServiceDto);

            _context.Services.Update(service);
            await _context.SaveChangesAsync();

            return ServiceMapper.ToServiceDTO(service);
        }
    }
}