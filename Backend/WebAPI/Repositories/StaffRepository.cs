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

        // ── US-02-E-01 / US-02-G-02: View Staff (includes owner) ────────────────

        public async Task<IEnumerable<StaffMemberDTO>> GetStaffAsync(Guid businessId, Guid callerId)
        {
            var business = await GetBusinessAndVerifyOwnerAsync(businessId, callerId);

            // Load all services for this business, using AssignedStaffId as truth
            var allServices = await _context.Services
                .Where(s => s.BusinessId == businessId)
                .ToListAsync();

            var serviceById = allServices.ToDictionary(s => s.Id);

            var result = new List<StaffMemberDTO>();

            // ── Owner entry (US-02-G-02) ─────────────────────────────────────
            var owner = await _context.Users.FindAsync(business.OwnerId);
            if (owner != null)
            {
                var ownerServiceNames = allServices
                    .Where(s => s.AssignedStaffId == owner.Id)
                    .Select(s => s.Name)
                    .ToList();

                result.Add(new StaffMemberDTO
                {
                    UserId = owner.Id,
                    Name = owner.Name,
                    Email = owner.Email,
                    JoinedAt = business.CreatedAt,
                    AssignedServiceNames = ownerServiceNames,
                    IsOwner = true
                });
            }

            // ── Accepted partners ────────────────────────────────────────────
            var acceptedPartners = business.Partners
                .Where(p => p.Status == InvitationStatus.Accepted && p.UserId != business.OwnerId)
                .ToList();

            if (acceptedPartners.Any())
            {
                var partnerUserIds = acceptedPartners.Select(p => p.UserId).ToList();
                var users = await _context.Users
                    .Where(u => partnerUserIds.Contains(u.Id))
                    .ToDictionaryAsync(u => u.Id);

                foreach (var partner in acceptedPartners)
                {
                    if (!users.TryGetValue(partner.UserId, out var user)) continue;

                    // Use AssignedStaffId on Service as authoritative source
                    var assignedNames = allServices
                        .Where(s => s.AssignedStaffId == user.Id)
                        .Select(s => s.Name)
                        .ToList();

                    result.Add(new StaffMemberDTO
                    {
                        UserId = user.Id,
                        Name = user.Name,
                        Email = user.Email,
                        JoinedAt = partner.JoinedAt,
                        AssignedServiceNames = assignedNames,
                        IsOwner = false
                    });
                }
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

            // Clear AssignedStaffId from all services this person was assigned to
            var assignedServices = await _context.Services
                .Where(s => s.BusinessId == businessId && s.AssignedStaffId == userId)
                .ToListAsync();
            foreach (var svc in assignedServices)
            {
                svc.AssignedStaffId = null;
                svc.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        // ── US-02-E-04 / US-02-G-01: Service Assignments ─────────────────────

        public async Task<IEnumerable<Guid>> GetStaffServicesAsync(Guid businessId, Guid userId, Guid callerId)
        {
            var business = await _context.Businesses
                .Include(b => b.Partners)
                .FirstOrDefaultAsync(b => b.Id == businessId)
                ?? throw new KeyNotFoundException($"Business {businessId} not found.");

            // Allow owner OR the person reading their own assignments
            bool isOwner = business.OwnerId == callerId;
            bool isSelf = callerId == userId;
            if (!isOwner && !isSelf)
                throw new UnauthorizedAccessException("Only the business owner or the staff member themselves can view service assignments.");

            // US-02-G-01: use AssignedStaffId as authoritative source
            // For the owner, no partner record is required
            bool isMember = business.OwnerId == userId
                || business.Partners.Any(p => p.UserId == userId && p.Status == InvitationStatus.Accepted);
            if (!isMember)
                throw new KeyNotFoundException("Staff member not found.");

            return await _context.Services
                .Where(s => s.BusinessId == businessId && s.AssignedStaffId == userId)
                .Select(s => s.Id)
                .ToListAsync();
        }

        public async Task UpdateStaffServicesAsync(Guid businessId, Guid userId, Guid callerId, List<Guid> serviceIds)
        {
            var business = await GetBusinessAndVerifyOwnerAsync(businessId, callerId);

            // Ensure the person exists in this business (owner or accepted partner)
            bool isMember = business.OwnerId == userId
                || business.Partners.Any(p => p.UserId == userId && p.Status == InvitationStatus.Accepted);
            if (!isMember)
                throw new KeyNotFoundException("Staff member not found.");

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

            // US-02-G-01: update AssignedStaffId on service entities (enforces 1-to-1)
            // First clear this person from any services they currently hold
            var currentlyAssigned = await _context.Services
                .Where(s => s.BusinessId == businessId && s.AssignedStaffId == userId)
                .ToListAsync();
            foreach (var svc in currentlyAssigned)
            {
                svc.AssignedStaffId = null;
                svc.UpdatedAt = DateTime.UtcNow;
            }

            // Then assign to the new list
            if (serviceIds.Any())
            {
                var toAssign = await _context.Services
                    .Where(s => s.BusinessId == businessId && serviceIds.Contains(s.Id))
                    .ToListAsync();
                foreach (var svc in toAssign)
                {
                    svc.AssignedStaffId = userId;
                    svc.UpdatedAt = DateTime.UtcNow;
                }
            }

            // Keep legacy partner.Services list in sync (for partner dashboard)
            var partner = await _context.BusinessPartners
                .FirstOrDefaultAsync(p => p.BusinessId == businessId && p.UserId == userId && p.Status == InvitationStatus.Accepted);
            if (partner != null)
            {
                partner.Services = serviceIds;
                partner.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        // ── US-02-F-03: Partner Stats ─────────────────────────────────────────

        public async Task<PartnerStatsDTO> GetPartnerStatsAsync(Guid partnerId)
        {
            var now = DateTime.UtcNow;

            // Find this partner's accepted business association
            var partnerRecord = await _context.BusinessPartners
                .FirstOrDefaultAsync(p => p.UserId == partnerId && p.Status == InvitationStatus.Accepted)
                ?? throw new KeyNotFoundException("No active business association found for this partner.");

            var businessId = partnerRecord.BusinessId;

            // Business info
            var business = await _context.Businesses.FindAsync(businessId);

            // Assigned services — use AssignedStaffId as authoritative source (US-02-G-01)
            var assignedServices = await _context.Services
                .Where(s => s.BusinessId == businessId && s.AssignedStaffId == partnerId)
                .Select(s => new PartnerAssignedServiceDTO
                {
                    ServiceId = s.Id,
                    Name = s.Name,
                    DurationMinutes = s.Duration,
                    Price = s.Price
                })
                .ToListAsync();

            // Today range (UTC)
            var todayStart = now.Date;
            var todayEnd = todayStart.AddDays(1);

            // This week range (Monday → Sunday, UTC)
            var weekStart = todayStart.AddDays(-(int)now.DayOfWeek == 0 ? 6 : (int)now.DayOfWeek - 1);
            var weekEnd = weekStart.AddDays(7);

            // All future appointments for this partner
            var futureAppointments = await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Client)
                .Where(a => a.PartnerId == partnerId
                         && a.BusinessId == businessId
                         && a.Status == AppointmentStatus.scheduled
                         && a.StartDateTime >= now)
                .OrderBy(a => a.StartDateTime)
                .ToListAsync();

            // Next appointment
            var next = futureAppointments.FirstOrDefault();
            PartnerNextAppointmentDTO? nextDto = null;
            if (next != null)
            {
                nextDto = new PartnerNextAppointmentDTO
                {
                    AppointmentId = next.Id,
                    StartDateTime = next.StartDateTime,
                    CustomerName = next.Client?.Name ?? "Customer",
                    ServiceName = next.Service?.Name ?? "Service",
                    DurationMinutes = next.Service?.Duration ?? 0
                };
            }

            // Today count (all scheduled appointments today)
            var todayAppointments = await _context.Appointments
                .Where(a => a.PartnerId == partnerId
                         && a.BusinessId == businessId
                         && a.Status == AppointmentStatus.scheduled
                         && a.StartDateTime >= todayStart
                         && a.StartDateTime < todayEnd)
                .CountAsync();

            // Week count
            var weekAppointments = await _context.Appointments
                .Where(a => a.PartnerId == partnerId
                         && a.BusinessId == businessId
                         && a.Status == AppointmentStatus.scheduled
                         && a.StartDateTime >= weekStart
                         && a.StartDateTime < weekEnd)
                .CountAsync();

            return new PartnerStatsDTO
            {
                NextAppointment = nextDto,
                TodayCount = todayAppointments,
                WeekCount = weekAppointments,
                AssignedServices = assignedServices,
                Business = business == null ? null : new PartnerWorkplaceDTO
                {
                    BusinessId = business.Id,
                    Name = business.Name,
                    LogoUrl = business.LogoUrl,
                    Slug = business.Slug
                }
            };
        }

        // ── Inactive Staff (removed / declined / expired) ────────────────────

        public async Task<IEnumerable<InactiveStaffEntryDTO>> GetInactiveStaffAsync(Guid businessId, Guid callerId)
        {
            await GetBusinessAndVerifyOwnerAsync(businessId, callerId);

            var results = new List<InactiveStaffEntryDTO>();

            // 1. Removed staff — BusinessPartner records with status Removed
            var removedPartners = await _context.BusinessPartners
                .Where(p => p.BusinessId == businessId && p.Status == InvitationStatus.Removed)
                .ToListAsync();

            if (removedPartners.Any())
            {
                var userIds = removedPartners.Select(p => p.UserId).ToList();
                var users = await _context.Users
                    .Where(u => userIds.Contains(u.Id))
                    .ToDictionaryAsync(u => u.Id);

                foreach (var partner in removedPartners)
                {
                    users.TryGetValue(partner.UserId, out var user);
                    results.Add(new InactiveStaffEntryDTO
                    {
                        EntryType = InactiveStaffEntryType.RemovedStaff,
                        UserId = partner.UserId,
                        Name = user?.Name,
                        Email = user?.Email ?? string.Empty,
                        StatusChangedAt = partner.UpdatedAt
                    });
                }
            }

            // 2. Declined invitations
            var declinedInvitations = await _context.BusinessInvitations
                .Where(i => i.BusinessId == businessId && i.Status == InvitationStatus.Declined)
                .ToListAsync();

            foreach (var inv in declinedInvitations)
            {
                results.Add(new InactiveStaffEntryDTO
                {
                    EntryType = InactiveStaffEntryType.DeclinedInvitation,
                    UserId = inv.WorkerId,
                    Name = inv.WorkerId.HasValue
                        ? (await _context.Users.FindAsync(inv.WorkerId.Value))?.Name
                        : null,
                    Email = inv.WorkerEmail,
                    StatusChangedAt = inv.RespondedAt ?? inv.UpdatedAt
                });
            }

            // 3. Expired invitations (no response before deadline)
            var expiredInvitations = await _context.BusinessInvitations
                .Where(i => i.BusinessId == businessId && i.Status == InvitationStatus.Expired)
                .ToListAsync();

            foreach (var inv in expiredInvitations)
            {
                results.Add(new InactiveStaffEntryDTO
                {
                    EntryType = InactiveStaffEntryType.ExpiredInvitation,
                    UserId = inv.WorkerId,
                    Name = null, // no need to look up name for expired
                    Email = inv.WorkerEmail,
                    StatusChangedAt = inv.ExpirationDate
                });
            }

            return results.OrderByDescending(e => e.StatusChangedAt);
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
