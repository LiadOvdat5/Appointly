using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Mappers;
using WebAPI.Models;

namespace WebAPI.Repositories
{
    public class StaffRepository : IStaffRepository
    {
        private readonly AppDbContext _context;

        public StaffRepository(AppDbContext context)
        {
            _context = context;
        }

        // ── Helpers ──────────────────────────────────────────────────────────

        private async Task<Business> GetBusinessAndVerifyOwnerAsync(Guid businessId, Guid callerId)
        {
            var business = await _context.Businesses
                .Include(b => b.Partners)
                .FirstOrDefaultAsync(b => b.Id == businessId)
                ?? throw new KeyNotFoundException($"Business {businessId} not found.");

            if (business.OwnerId != callerId)
                throw new UnauthorizedAccessException("Only the business owner can manage staff.");

            return business;
        }

        // ── US-02-E-01: View Staff ────────────────────────────────────────────

        public async Task<IEnumerable<StaffMemberDTO>> GetStaffAsync(Guid businessId, Guid callerId)
        {
            var business = await GetBusinessAndVerifyOwnerAsync(businessId, callerId);

            var acceptedPartners = business.Partners
                .Where(p => p.Status == InvitationStatus.Accepted && p.UserId != business.OwnerId)
                .ToList();

            if (!acceptedPartners.Any())
                return Enumerable.Empty<StaffMemberDTO>();

            var partnerUserIds = acceptedPartners.Select(p => p.UserId).ToList();

            var users = await _context.Users
                .Where(u => partnerUserIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id);

            // Load all services for this business once
            var allServices = await _context.Services
                .Where(s => s.BusinessId == businessId)
                .ToDictionaryAsync(s => s.Id, s => s.Name);

            var result = new List<StaffMemberDTO>();
            foreach (var partner in acceptedPartners)
            {
                if (!users.TryGetValue(partner.UserId, out var user)) continue;

                var assignedNames = partner.Services
                    .Where(sid => allServices.ContainsKey(sid))
                    .Select(sid => allServices[sid])
                    .ToList();

                result.Add(new StaffMemberDTO
                {
                    UserId = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    JoinedAt = partner.JoinedAt,
                    AssignedServiceNames = assignedNames
                });
            }

            return result;
        }

        // ── US-02-E-02: Invitations ───────────────────────────────────────────

        public async Task<IEnumerable<BusinessInvitationDTO>> GetPendingInvitationsAsync(Guid businessId, Guid callerId)
        {
            await GetBusinessAndVerifyOwnerAsync(businessId, callerId);

            var now = DateTime.UtcNow;
            var pendingInvitations = await _context.BusinessInvitations
                .Where(i => i.BusinessId == businessId && i.Status == InvitationStatus.Pending)
                .ToListAsync();

            // Auto-expire stale invitations
            bool hasExpired = false;
            foreach (var inv in pendingInvitations.Where(i => i.ExpirationDate < now))
            {
                inv.Status = InvitationStatus.Expired;
                inv.UpdatedAt = now;
                hasExpired = true;
            }
            if (hasExpired)
                await _context.SaveChangesAsync();

            var business = await _context.Businesses.FindAsync(businessId);
            var businessName = business?.Name ?? string.Empty;

            return pendingInvitations
                .Where(i => i.Status == InvitationStatus.Pending)
                .Select(i => BusinessInvitationMapper.ToBusinessInvitationDTO(i, businessName))
                .ToList();
        }

        public async Task CancelInvitationAsync(Guid businessId, Guid invitationId, Guid callerId)
        {
            await GetBusinessAndVerifyOwnerAsync(businessId, callerId);

            var invitation = await _context.BusinessInvitations
                .FirstOrDefaultAsync(i => i.Id == invitationId && i.BusinessId == businessId)
                ?? throw new KeyNotFoundException("Invitation not found.");

            if (invitation.Status != InvitationStatus.Pending)
                throw new InvalidOperationException("Only pending invitations can be cancelled.");

            invitation.Status = InvitationStatus.Cancelled;
            invitation.UpdatedAt = DateTime.UtcNow;

            // If a pending BusinessPartner record was created, remove it
            var partner = await _context.BusinessPartners
                .FirstOrDefaultAsync(p => p.BusinessId == businessId && p.InvitationId == invitationId && p.Status == InvitationStatus.Pending);
            if (partner != null)
                _context.BusinessPartners.Remove(partner);

            await _context.SaveChangesAsync();
        }

        // ── US-02-E-03: Remove Staff ──────────────────────────────────────────

        public async Task RemoveStaffAsync(Guid businessId, Guid userId, Guid callerId)
        {
            var business = await GetBusinessAndVerifyOwnerAsync(businessId, callerId);

            if (userId == callerId)
                throw new InvalidOperationException("The business owner cannot remove themselves.");

            var partner = business.Partners.FirstOrDefault(p => p.UserId == userId && p.Status == InvitationStatus.Accepted)
                ?? throw new KeyNotFoundException("Staff member not found or already removed.");

            // Soft delete
            partner.Status = InvitationStatus.Removed;
            partner.Services = new List<Guid>();
            partner.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        // ── US-02-E-04: Service Assignments ──────────────────────────────────

        public async Task<IEnumerable<Guid>> GetStaffServicesAsync(Guid businessId, Guid userId, Guid callerId)
        {
            var business = await _context.Businesses
                .Include(b => b.Partners)
                .FirstOrDefaultAsync(b => b.Id == businessId)
                ?? throw new KeyNotFoundException($"Business {businessId} not found.");

            // Allow owner OR the partner reading their own assignments
            bool isOwner = business.OwnerId == callerId;
            bool isSelf = callerId == userId;
            if (!isOwner && !isSelf)
                throw new UnauthorizedAccessException("Only the business owner or the staff member themselves can view service assignments.");

            var partner = await _context.BusinessPartners
                .FirstOrDefaultAsync(p => p.BusinessId == businessId && p.UserId == userId && p.Status == InvitationStatus.Accepted)
                ?? throw new KeyNotFoundException("Staff member not found.");

            return partner.Services;
        }

        public async Task UpdateStaffServicesAsync(Guid businessId, Guid userId, Guid callerId, List<Guid> serviceIds)
        {
            await GetBusinessAndVerifyOwnerAsync(businessId, callerId);

            var partner = await _context.BusinessPartners
                .FirstOrDefaultAsync(p => p.BusinessId == businessId && p.UserId == userId && p.Status == InvitationStatus.Accepted)
                ?? throw new KeyNotFoundException("Staff member not found.");

            // Validate that all provided serviceIds belong to this business
            if (serviceIds.Any())
            {
                var validIds = await _context.Services
                    .Where(s => s.BusinessId == businessId && serviceIds.Contains(s.Id))
                    .Select(s => s.Id)
                    .ToListAsync();

                var invalid = serviceIds.Except(validIds).ToList();
                if (invalid.Any())
                    throw new KeyNotFoundException($"Services not found in this business: {string.Join(", ", invalid)}");
            }

            partner.Services = serviceIds;
            partner.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        // ── US-02-E-05: Staff Report ──────────────────────────────────────────

        public async Task<StaffReportDTO> GetStaffReportAsync(Guid businessId, Guid userId, Guid callerId, DateTime? startDate, DateTime? endDate)
        {
            await GetBusinessAndVerifyOwnerAsync(businessId, callerId);

            var user = await _context.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException("User not found.");

            var partner = await _context.BusinessPartners
                .FirstOrDefaultAsync(p => p.BusinessId == businessId && p.UserId == userId && p.Status == InvitationStatus.Accepted)
                ?? throw new KeyNotFoundException("Staff member not found.");

            var now = DateTime.UtcNow;
            var start = startDate ?? new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var end = endDate ?? new DateTime(now.Year, now.Month + 1, 1, 0, 0, 0, DateTimeKind.Utc).AddTicks(-1);

            var allAppointments = await _context.Appointments
                .Include(a => a.Service)
                .Where(a => a.BusinessId == businessId && a.PartnerId == userId)
                .ToListAsync();

            var periodAppointments = allAppointments
                .Where(a => a.StartDateTime >= start && a.StartDateTime <= end)
                .ToList();

            var completed = periodAppointments.Count(a => a.Status == AppointmentStatus.completed);
            var total = periodAppointments.Count(a => a.Status != AppointmentStatus.canceled);
            var completionRate = total > 0 ? Math.Round((decimal)completed / total * 100, 1) : 0;

            var revenue = periodAppointments
                .Where(a => a.Status == AppointmentStatus.completed && a.Service?.Price != null)
                .Sum(a => a.Service!.Price!.Value);

            var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var currentMonthCount = allAppointments.Count(a =>
                a.StartDateTime >= monthStart &&
                a.Status != AppointmentStatus.canceled);

            return new StaffReportDTO
            {
                UserId = userId,
                Name = user.Name,
                TotalAppointments = total,
                CurrentMonthAppointments = currentMonthCount,
                Revenue = revenue,
                CompletionRate = completionRate,
                AverageRating = null // Placeholder for Reviews epic
            };
        }
    }
}
