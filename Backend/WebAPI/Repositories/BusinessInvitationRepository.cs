using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Mappers;
using WebAPI.Models;

namespace WebAPI.Repositories
{
    public class BusinessInvitationRepository : IBusinessInvitationRepository
    {
        private readonly AppDbContext _context;

        public BusinessInvitationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<BusinessInvitationDTO> InviteWorkerAsync(Guid businessId, Guid ownerId, InviteWorkerDTO dto)
        {
            var normalizedEmail = dto.WorkerEmail.Trim().ToLowerInvariant();

            var business = await _context.Businesses
                .Include(b => b.Partners)
                .FirstOrDefaultAsync(b => b.Id == businessId);

            if (business == null)
                throw new KeyNotFoundException($"Business with ID {businessId} not found.");

            if (business.OwnerId != ownerId)
                throw new UnauthorizedAccessException("Only the business owner can invite workers.");

            var existingPending = await _context.BusinessInvitations.FirstOrDefaultAsync(inv =>
                inv.BusinessId == businessId &&
                inv.WorkerEmail.ToLower() == normalizedEmail &&
                inv.Status == InvitationStatus.Pending);

            if (existingPending != null)
                throw new InvalidOperationException("An active invitation already exists for this worker.");

            var worker = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
            Guid? workerId = worker?.Id;

            var expirationDate = DateTime.UtcNow.AddDays(7);

            var invitation = BusinessInvitationMapper.ToBusinessInvitation(dto, businessId, ownerId, workerId, expirationDate);
            invitation.WorkerEmail = normalizedEmail;

            _context.BusinessInvitations.Add(invitation);

            if (workerId.HasValue)
            {
                var partner = new BusinessPartner
                {
                    BusinessId = businessId,
                    UserId = workerId.Value,
                    Status = InvitationStatus.Pending,
                    InvitationId = invitation.Id,
                    JoinedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.BusinessPartners.Add(partner);
            }

            await _context.SaveChangesAsync();

            return BusinessInvitationMapper.ToBusinessInvitationDTO(invitation, business.Name);
        }

        public async Task<IEnumerable<BusinessInvitationDTO>> GetInvitationsForWorkerAsync(Guid workerId)
        {
            var user = await _context.Users.FindAsync(workerId)
                ?? throw new KeyNotFoundException("User not found.");

            var normalizedEmail = user.Email.ToLowerInvariant();

            var invitations = await _context.BusinessInvitations
                .Where(inv => inv.WorkerId == workerId || (inv.WorkerId == null && inv.WorkerEmail.ToLower() == normalizedEmail))
                .ToListAsync();

            var businessIds = invitations.Select(i => i.BusinessId).Distinct().ToList();
            var businesses = await _context.Businesses
                .Where(b => businessIds.Contains(b.Id))
                .Select(b => new { b.Id, b.Name })
                .ToListAsync();

            var businessNameLookup = businesses.ToDictionary(b => b.Id, b => b.Name);

            // Auto-expire pending invitations past their expiration
            var now = DateTime.UtcNow;
            bool hasExpired = false;
            foreach (var inv in invitations.Where(i => i.Status == InvitationStatus.Pending && i.ExpirationDate < now))
            {
                inv.Status = InvitationStatus.Expired;
                inv.UpdatedAt = now;
                hasExpired = true;
            }
            if (hasExpired)
            {
                await _context.SaveChangesAsync();
            }

            return invitations
                .Select(inv => BusinessInvitationMapper.ToBusinessInvitationDTO(inv, businessNameLookup.GetValueOrDefault(inv.BusinessId, string.Empty)))
                .ToList();
        }

        public async Task<BusinessInvitationDTO> RespondToInvitationAsync(Guid invitationId, Guid workerId, bool accept)
        {
            var invitation = await _context.BusinessInvitations.FirstOrDefaultAsync(i => i.Id == invitationId)
                ?? throw new KeyNotFoundException("Invitation not found.");

            var now = DateTime.UtcNow;

            if (invitation.Status != InvitationStatus.Pending)
                throw new InvalidOperationException("Invitation is no longer pending.");

            if (invitation.ExpirationDate < now)
            {
                invitation.Status = InvitationStatus.Expired;
                invitation.UpdatedAt = now;
                await _context.SaveChangesAsync();
                throw new InvalidOperationException("Invitation has expired.");
            }

            var user = await _context.Users.FindAsync(workerId)
                ?? throw new KeyNotFoundException("User not found.");

            // Authorization: match worker
            var normalizedEmail = user.Email.ToLowerInvariant();
            var isAuthorized = (invitation.WorkerId == workerId) ||
                               (invitation.WorkerId == null && invitation.WorkerEmail.ToLower() == normalizedEmail);
            if (!isAuthorized)
                throw new UnauthorizedAccessException("You are not authorized to respond to this invitation.");

            var business = await _context.Businesses.Include(b => b.Partners).FirstOrDefaultAsync(b => b.Id == invitation.BusinessId)
                ?? throw new KeyNotFoundException("Business not found.");

            invitation.WorkerId = workerId;
            invitation.RespondedAt = now;
            invitation.UpdatedAt = now;
            invitation.Status = accept ? InvitationStatus.Accepted : InvitationStatus.Declined;

            var partner = business.Partners.FirstOrDefault(p => p.UserId == workerId);
            if (partner == null)
            {
                partner = new BusinessPartner
                {
                    BusinessId = business.Id,
                    UserId = workerId,
                    InvitationId = invitation.Id,
                    Status = invitation.Status,
                    JoinedAt = now,
                    CreatedAt = now,
                    UpdatedAt = now
                };
                _context.BusinessPartners.Add(partner);
            }
            else
            {
                partner.Status = invitation.Status;
                partner.InvitationId = invitation.Id;
                partner.UpdatedAt = now;
                if (accept)
                {
                    partner.JoinedAt = now;
                }
            }

            if (accept && user.Role == UserRole.client)
            {
                user.Role = UserRole.partner;
                user.UpdatedAt = now;
            }

            await _context.SaveChangesAsync();

            return BusinessInvitationMapper.ToBusinessInvitationDTO(invitation, business.Name);
        }
    }
}
