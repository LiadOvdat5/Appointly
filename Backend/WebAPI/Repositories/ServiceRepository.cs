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

            return ServiceMapper.ToServiceDTO(service, businessOwnerId: business.OwnerId);
        }

        public async Task<IEnumerable<ServiceDTO>> GetServicesForBusinessAsync(Guid businessId)
        {
            var business = await _context.Businesses.FindAsync(businessId);
            if (business == null)
                throw new KeyNotFoundException($"Business with ID {businessId} not found.");

            var services = await _context.Services
                .Include(s => s.AssignedStaff)
                .Where(s => s.BusinessId == businessId)
                .ToListAsync();

            return services.Select(s => ServiceMapper.ToServiceDTO(s, businessOwnerId: business.OwnerId)).ToList();
        }

        public async Task<ServiceDTO> UpdateServiceAsync(Guid businessId, Guid serviceId, Guid ownerId, UpdateServiceDTO updateServiceDto)
        {
            var service = await _context.Services
                .Include(s => s.AssignedStaff)
                .FirstOrDefaultAsync(s => s.Id == serviceId)
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

            // Reload AssignedStaff nav property if it changed
            await _context.Entry(service).Reference(s => s.AssignedStaff).LoadAsync();

            // Recalculate business categories after updating service
            await RecalculateBusinessCategories(service.BusinessId);

            return ServiceMapper.ToServiceDTO(service, businessOwnerId: business.OwnerId);
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
                .Include(s => s.AssignedStaff)
                .FirstOrDefaultAsync(s => s.Id == serviceId);
        }

        // ── US-02-G-01: Single-staff assignment ────────────────────────────────

        public async Task<ServiceAssignmentResponseDTO?> GetAssignmentAsync(Guid businessId, Guid serviceId, Guid callerId)
        {
            var business = await _context.Businesses.FindAsync(businessId)
                ?? throw new KeyNotFoundException("Business not found.");
            if (business.OwnerId != callerId)
                throw new UnauthorizedAccessException("Only the business owner can view service assignments.");

            var service = await _context.Services
                .Include(s => s.AssignedStaff)
                .FirstOrDefaultAsync(s => s.Id == serviceId && s.BusinessId == businessId)
                ?? throw new KeyNotFoundException("Service not found.");

            if (!service.AssignedStaffId.HasValue)
                return null;

            return new ServiceAssignmentResponseDTO
            {
                StaffId = service.AssignedStaffId,
                StaffName = service.AssignedStaff?.Name,
                IsOwner = service.AssignedStaffId == business.OwnerId,
                BlockOnBooking = service.BlockOnBooking
            };
        }

        public async Task<ServiceAssignmentResponseDTO> SetAssignmentAsync(Guid businessId, Guid serviceId, Guid callerId, Guid? staffId)
        {
            var business = await _context.Businesses
                .Include(b => b.Partners)
                .FirstOrDefaultAsync(b => b.Id == businessId)
                ?? throw new KeyNotFoundException("Business not found.");
            if (business.OwnerId != callerId)
                throw new UnauthorizedAccessException("Only the business owner can change service assignments.");

            var service = await _context.Services
                .Include(s => s.AssignedStaff)
                .FirstOrDefaultAsync(s => s.Id == serviceId && s.BusinessId == businessId)
                ?? throw new KeyNotFoundException("Service not found.");

            if (staffId.HasValue)
            {
                // Staff must be the owner OR an accepted partner
                bool isOwner = staffId.Value == business.OwnerId;
                bool isPartner = business.Partners.Any(p => p.UserId == staffId.Value && p.Status == InvitationStatus.Accepted);
                if (!isOwner && !isPartner)
                    throw new KeyNotFoundException("The specified person is not a member of this business.");

                service.AssignedStaffId = staffId.Value;
                // Sync the legacy BusinessPartner.Services list
                await SyncLegacyPartnerServicesAsync(businessId, serviceId, staffId.Value);
            }
            else
            {
                // Clear previous assignee's legacy list entry
                if (service.AssignedStaffId.HasValue)
                    await SyncLegacyPartnerServicesAsync(businessId, serviceId, null, previousStaffId: service.AssignedStaffId.Value);

                service.AssignedStaffId = null;
            }

            service.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            await _context.Entry(service).Reference(s => s.AssignedStaff).LoadAsync();

            return new ServiceAssignmentResponseDTO
            {
                StaffId = service.AssignedStaffId,
                StaffName = service.AssignedStaff?.Name,
                IsOwner = service.AssignedStaffId.HasValue && service.AssignedStaffId == business.OwnerId,
                BlockOnBooking = service.BlockOnBooking
            };
        }

        public async Task UpdateAssignmentPreferencesAsync(Guid businessId, Guid serviceId, Guid callerId, bool blockOnBooking)
        {
            var business = await _context.Businesses.FindAsync(businessId)
                ?? throw new KeyNotFoundException("Business not found.");
            if (business.OwnerId != callerId)
                throw new UnauthorizedAccessException("Only the business owner can update assignment preferences.");

            var service = await _context.Services
                .FirstOrDefaultAsync(s => s.Id == serviceId && s.BusinessId == businessId)
                ?? throw new KeyNotFoundException("Service not found.");

            service.BlockOnBooking = blockOnBooking;
            service.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Keeps BusinessPartner.Services in sync with AssignedStaffId changes so that
        /// existing partner-dashboard features still work during transition.
        /// </summary>
        private async Task SyncLegacyPartnerServicesAsync(
            Guid businessId, Guid serviceId, Guid? newStaffId, Guid? previousStaffId = null)
        {
            // Remove from old partner's list
            var prevId = previousStaffId;
            if (!prevId.HasValue)
            {
                // Find who currently holds this service in the legacy list
                var currentService = await _context.Services.FindAsync(serviceId);
                prevId = currentService?.AssignedStaffId;
            }

            if (prevId.HasValue)
            {
                var oldPartner = await _context.BusinessPartners
                    .FirstOrDefaultAsync(p => p.BusinessId == businessId && p.UserId == prevId.Value);
                if (oldPartner != null)
                {
                    oldPartner.Services = oldPartner.Services.Where(id => id != serviceId).ToList();
                    oldPartner.UpdatedAt = DateTime.UtcNow;
                }
            }

            // Add to new partner's list (if not owner, owners don't have a partner record)
            if (newStaffId.HasValue)
            {
                var newPartner = await _context.BusinessPartners
                    .FirstOrDefaultAsync(p => p.BusinessId == businessId && p.UserId == newStaffId.Value);
                if (newPartner != null && !newPartner.Services.Contains(serviceId))
                {
                    newPartner.Services = newPartner.Services.Append(serviceId).ToList();
                    newPartner.UpdatedAt = DateTime.UtcNow;
                }
            }
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