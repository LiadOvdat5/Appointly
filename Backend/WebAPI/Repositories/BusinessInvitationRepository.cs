using System.Security.Cryptography;
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
        private readonly IEmailService _emailService;
        private readonly IConfiguration _config;
        private readonly INotificationService _notificationService;

        public BusinessInvitationRepository(AppDbContext context, IEmailService emailService, IConfiguration config, INotificationService notificationService)
        {
            _context = context;
            _emailService = emailService;
            _config = config;
            _notificationService = notificationService;
        }

        private static string GenerateInviteToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(32);
            return Convert.ToBase64String(bytes)
                .Replace("+", "-").Replace("/", "_").Replace("=", "");
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

            // Generate an invite token for unregistered users so they can be
            // linked back to this invitation after they sign up.
            string? inviteToken = workerId.HasValue ? null : GenerateInviteToken();

            var invitation = BusinessInvitationMapper.ToBusinessInvitation(dto, businessId, ownerId, workerId, expirationDate);
            invitation.WorkerEmail = normalizedEmail;
            invitation.InviteToken = inviteToken;

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

            // Send in-app notification to registered workers
            if (workerId.HasValue)
            {
                try
                {
                    await _notificationService.CreateNotificationAsync(
                        userId: workerId.Value,
                        titleKey: "notifications.invitationReceived.title",
                        bodyKey: "notifications.invitationReceived.body",
                        type: NotificationType.InvitationReceived,
                        relatedEntityId: invitation.Id,
                        targetPath: "/invitations",
                        bodyParams: new Dictionary<string, string>
                        {
                            ["businessName"] = business.Name
                        });
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"[BusinessInvitationRepository] Failed to create invitation notification: {ex.Message}");
                }
            }

            // Send invite email to unregistered users
            if (!workerId.HasValue && inviteToken != null)
            {
                var frontendBaseUrl = _config["FrontendBaseUrl"] ?? "http://localhost:5173";
                var registrationLink = $"{frontendBaseUrl}/register?inviteToken={Uri.EscapeDataString(inviteToken)}";
                var subject = $"You're invited to join {business.Name} on BizSlot";
                var htmlBody = $"""
                    <div style="font-family:sans-serif;max-width:480px;margin:auto;">
                      <h2>You've been invited to join {System.Net.WebUtility.HtmlEncode(business.Name)}!</h2>
                      <p>You've been invited to join their team on <strong>BizSlot</strong>.</p>
                      {(dto.Message != null ? $"<blockquote style=\"border-left:3px solid #ccc;padding-left:12px;color:#555;\">{System.Net.WebUtility.HtmlEncode(dto.Message)}</blockquote>" : "")}
                      <p>Click the button below to create your account and accept the invitation:</p>
                      <a href="{registrationLink}"
                         style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
                        Create Account &amp; Accept Invitation
                      </a>
                      <p style="color:#999;font-size:12px;margin-top:24px;">
                        This invitation expires on {expirationDate:MMMM d, yyyy}. If you didn't expect this, you can safely ignore it.
                      </p>
                    </div>
                    """;
                try
                {
                    await _emailService.SendEmailAsync(normalizedEmail, subject, htmlBody);
                }
                catch (Exception ex)
                {
                    // Non-fatal — invitation is saved; email send failure is logged but not propagated
                    Console.Error.WriteLine($"[BusinessInvitationRepository] Failed to send invite email to {normalizedEmail}: {ex.Message}");
                }
            }

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

        public async Task<BusinessInvitationDTO?> GetInvitationByTokenAsync(string token)
        {
            var invitation = await _context.BusinessInvitations
                .FirstOrDefaultAsync(i => i.InviteToken == token);

            if (invitation == null) return null;

            var business = await _context.Businesses.FindAsync(invitation.BusinessId);
            return BusinessInvitationMapper.ToBusinessInvitationDTO(invitation, business?.Name ?? string.Empty);
        }

        public async Task AutoAcceptInvitationAsync(string token, Guid newUserId)
        {
            var invitation = await _context.BusinessInvitations
                .FirstOrDefaultAsync(i => i.InviteToken == token)
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

            var user = await _context.Users.FindAsync(newUserId)
                ?? throw new KeyNotFoundException("User not found.");

            invitation.WorkerId = newUserId;
            invitation.Status = InvitationStatus.Accepted;
            invitation.RespondedAt = now;
            invitation.UpdatedAt = now;
            invitation.InviteToken = null; // consume the token

            var partner = await _context.BusinessPartners
                .FirstOrDefaultAsync(p => p.BusinessId == invitation.BusinessId && p.UserId == newUserId);

            if (partner == null)
            {
                _context.BusinessPartners.Add(new BusinessPartner
                {
                    BusinessId = invitation.BusinessId,
                    UserId = newUserId,
                    InvitationId = invitation.Id,
                    Status = InvitationStatus.Accepted,
                    JoinedAt = now,
                    CreatedAt = now,
                    UpdatedAt = now
                });
            }
            else
            {
                partner.Status = InvitationStatus.Accepted;
                partner.InvitationId = invitation.Id;
                partner.JoinedAt = now;
                partner.UpdatedAt = now;
            }

            if (user.Role == UserRole.client)
            {
                user.Role = UserRole.partner;
                user.UpdatedAt = now;
            }

            await _context.SaveChangesAsync();
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
