using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Repositories
{
    public class AdminRepository : IAdminRepository
    {
        private static readonly Guid UncategorizedId = Guid.Parse("11111111-1111-1111-1111-111111111111");

        private readonly AppDbContext _context;

        public AdminRepository(AppDbContext context)
        {
            _context = context;
        }

        // ── Users ──────────────────────────────────────────────────────────────

        public async Task<AdminUsersPageDTO> GetUsersPagedAsync(string? search, string? role, int page, int pageSize)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(u =>
                    u.Name.ToLower().Contains(term) ||
                    u.Email.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(role) &&
                Enum.TryParse<UserRole>(role, ignoreCase: true, out var parsedRole))
            {
                query = query.Where(u => u.Role == parsedRole);
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new AdminUserDTO
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    Role = u.Role.ToString(),
                    CreatedAt = u.CreatedAt,
                    IsSuspended = u.IsSuspended,
                    SuspendedReason = u.SuspendedReason,
                })
                .ToListAsync();

            return new AdminUsersPageDTO
            {
                Users = users,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages,
            };
        }

        public async Task SuspendUserAsync(Guid userId, string? reason)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException("User not found.");

            if (user.IsSuspended)
                throw new InvalidOperationException("User is already suspended.");

            user.IsSuspended = true;
            user.SuspendedReason = reason?.Trim();
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task ReactivateUserAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId)
                ?? throw new KeyNotFoundException("User not found.");

            if (!user.IsSuspended)
                throw new InvalidOperationException("User is not suspended.");

            user.IsSuspended = false;
            user.SuspendedReason = null;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        // ── Platform Stats ────────────────────────────────────────────────────

        public async Task<object> GetStatsAsync()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalBusinesses = await _context.Businesses.CountAsync();
            var totalAppointments = await _context.Appointments.CountAsync();
            var totalReviews = await _context.Reviews.CountAsync();
            var pendingFlaggedReviews = await _context.Reviews.CountAsync(r => r.IsFlagged && r.ResolvedAt == null);

            return new
            {
                totalUsers,
                totalBusinesses,
                totalAppointments,
                totalReviews,
                pendingFlaggedReviews,
            };
        }

        // ── Flagged Reviews ───────────────────────────────────────────────────

        public async Task<IEnumerable<AdminFlaggedReviewDTO>> GetFlaggedReviewsAsync()
        {
            var reviews = await _context.Reviews
                .Include(r => r.Customer)
                .Include(r => r.Business)
                .Where(r => r.IsFlagged && r.ResolvedAt == null)
                .OrderByDescending(r => r.FlaggedAt)
                .ToListAsync();

            return reviews.Select(r => new AdminFlaggedReviewDTO
            {
                Id = r.Id,
                BusinessId = r.BusinessId,
                BusinessName = r.Business?.Name ?? "Unknown",
                CustomerName = AnonymizeName(r.Customer?.Name),
                Rating = r.Rating,
                Comment = r.Comment,
                FlagReason = r.FlagReason,
                FlaggedAt = r.FlaggedAt,
                CreatedAt = r.CreatedAt,
            });
        }

        public async Task ResolveReviewAsync(Guid reviewId, string action, Guid? adminId)
        {
            var review = await _context.Reviews.FindAsync(reviewId)
                ?? throw new KeyNotFoundException("Review not found.");

            if (!review.IsFlagged)
                throw new InvalidOperationException("Review is not flagged.");

            if (review.ResolvedAt != null)
                throw new InvalidOperationException("Review has already been resolved.");

            review.ResolvedAt = DateTime.UtcNow;
            review.ResolvedByAdminId = adminId;

            if (action == "remove")
            {
                review.IsRemoved = true;
            }
            else // dismiss
            {
                review.IsFlagged = false;
                review.FlagReason = null;
                review.FlaggedAt = null;
            }

            await _context.SaveChangesAsync();

            // Recalculate business rating after removal
            if (action == "remove")
            {
                var remaining = await _context.Reviews
                    .Where(r => r.BusinessId == review.BusinessId && !r.IsRemoved)
                    .ToListAsync();

                var avg = remaining.Count > 0 ? Math.Round(remaining.Average(r => r.Rating), 1) : 0;
                var count = remaining.Count;

                var business = await _context.Businesses.FindAsync(review.BusinessId);
                if (business != null)
                {
                    business.AverageRating = avg;
                    business.ReviewCount = count;
                    await _context.SaveChangesAsync();
                }
            }
        }

        // ── Businesses ────────────────────────────────────────────────────────

        public async Task<AdminBusinessesPageDTO> GetBusinessesPagedAsync(string? search, int page, int pageSize)
        {
            var query = _context.Businesses.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(b => b.Name.ToLower().Contains(term));
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            var businesses = await query
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var ownerIds = businesses.Select(b => b.OwnerId).Distinct().ToList();
            var owners = await _context.Users
                .Where(u => ownerIds.Contains(u.Id))
                .Select(u => new { u.Id, u.Name, u.Email })
                .ToListAsync();
            var ownerMap = owners.ToDictionary(o => o.Id);

            var allCategoryIdStrings = businesses
                .Where(b => b.CategoryIds != null)
                .SelectMany(b => b.CategoryIds)
                .Distinct()
                .ToList();

            var categoryGuids = allCategoryIdStrings
                .Select(s => Guid.TryParse(s, out var g) ? (Guid?)g : null)
                .Where(g => g.HasValue)
                .Select(g => g!.Value)
                .ToList();

            var categories = categoryGuids.Count > 0
                ? await _context.Categories
                    .Where(c => categoryGuids.Contains(c.Id))
                    .Select(c => new { c.Id, c.Name })
                    .ToListAsync()
                : [];
            var categoryMap = categories.ToDictionary(c => c.Id.ToString(), c => c.Name);

            var result = businesses.Select(b =>
            {
                ownerMap.TryGetValue(b.OwnerId, out var owner);
                var categoryNames = b.CategoryIds?
                    .Where(id => categoryMap.ContainsKey(id))
                    .Select(id => categoryMap[id])
                    .ToList() ?? [];

                return new AdminBusinessDTO
                {
                    Id = b.Id,
                    Name = b.Name,
                    Slug = b.Slug,
                    OwnerName = owner?.Name ?? "Unknown",
                    OwnerEmail = owner?.Email ?? "",
                    Categories = categoryNames,
                    AverageRating = b.AverageRating,
                    ReviewCount = b.ReviewCount,
                    IsSuspended = b.IsSuspended,
                    SuspendedReason = b.SuspendedReason,
                    CreatedAt = b.CreatedAt,
                };
            }).ToList();

            return new AdminBusinessesPageDTO
            {
                Businesses = result,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages,
            };
        }

        public async Task SuspendBusinessAsync(Guid businessId, string? reason)
        {
            var business = await _context.Businesses.FindAsync(businessId)
                ?? throw new KeyNotFoundException("Business not found.");

            if (business.IsSuspended)
                throw new InvalidOperationException("Business is already suspended.");

            business.IsSuspended = true;
            business.SuspendedReason = reason?.Trim();
            business.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task ReactivateBusinessAsync(Guid businessId)
        {
            var business = await _context.Businesses.FindAsync(businessId)
                ?? throw new KeyNotFoundException("Business not found.");

            if (!business.IsSuspended)
                throw new InvalidOperationException("Business is not suspended.");

            business.IsSuspended = false;
            business.SuspendedReason = null;
            business.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        // ── Analytics ─────────────────────────────────────────────────────────

        public async Task<object> GetAppointmentAnalyticsAsync()
        {
            var statusCounts = await _context.Appointments
                .GroupBy(a => a.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            var booked    = statusCounts.FirstOrDefault(s => s.Status == AppointmentStatus.scheduled)?.Count ?? 0;
            var completed = statusCounts.FirstOrDefault(s => s.Status == AppointmentStatus.completed)?.Count ?? 0;
            var cancelled = statusCounts.FirstOrDefault(s => s.Status == AppointmentStatus.canceled)?.Count  ?? 0;
            var total     = booked + completed + cancelled;

            var nonPending = completed + cancelled;
            var completionRate   = nonPending > 0 ? Math.Round(completed * 100.0 / nonPending, 1) : 0.0;
            var cancellationRate = nonPending > 0 ? Math.Round(cancelled * 100.0 / nonPending, 1) : 0.0;

            var topByVolume = await _context.Appointments
                .GroupBy(a => a.BusinessId)
                .Select(g => new { BusinessId = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(10)
                .ToListAsync();

            var topVolumeIds = topByVolume.Select(x => x.BusinessId).ToList();
            var topVolumeBusinesses = await _context.Businesses
                .Where(b => topVolumeIds.Contains(b.Id))
                .Select(b => new { b.Id, b.Name, b.Slug })
                .ToListAsync();
            var topVolumeMap = topVolumeBusinesses.ToDictionary(b => b.Id);

            var topBusinessesByVolume = topByVolume
                .Where(x => topVolumeMap.ContainsKey(x.BusinessId))
                .Select(x => new
                {
                    businessId = x.BusinessId,
                    name  = topVolumeMap[x.BusinessId].Name,
                    slug  = topVolumeMap[x.BusinessId].Slug,
                    count = x.Count,
                })
                .ToList();

            var completionCandidates = await _context.Appointments
                .Where(a => a.Status == AppointmentStatus.completed || a.Status == AppointmentStatus.canceled)
                .GroupBy(a => a.BusinessId)
                .Select(g => new
                {
                    BusinessId = g.Key,
                    Total     = g.Count(),
                    Completed = g.Count(a => a.Status == AppointmentStatus.completed),
                })
                .Where(x => x.Total >= 5)
                .ToListAsync();

            var topCompletionIds = completionCandidates.Select(x => x.BusinessId).ToList();
            var topCompletionBusinesses = await _context.Businesses
                .Where(b => topCompletionIds.Contains(b.Id))
                .Select(b => new { b.Id, b.Name, b.Slug })
                .ToListAsync();
            var topCompletionMap = topCompletionBusinesses.ToDictionary(b => b.Id);

            var topBusinessesByCompletion = completionCandidates
                .Where(x => topCompletionMap.ContainsKey(x.BusinessId))
                .Select(x => new
                {
                    businessId = x.BusinessId,
                    name = topCompletionMap[x.BusinessId].Name,
                    slug = topCompletionMap[x.BusinessId].Slug,
                    rate = Math.Round(x.Completed * 100.0 / x.Total, 1),
                })
                .OrderByDescending(x => x.rate)
                .Take(5)
                .ToList();

            var now = DateTime.UtcNow;
            var months = Enumerable.Range(0, 12)
                .Select(i => new DateTime(now.Year, now.Month, 1).AddMonths(-11 + i))
                .ToList();

            var rangeStart = months.First();
            var rangeEnd   = months.Last().AddMonths(1);

            var monthlyCounts = await _context.Appointments
                .Where(a => a.StartDateTime >= rangeStart && a.StartDateTime < rangeEnd)
                .GroupBy(a => new { a.StartDateTime.Year, a.StartDateTime.Month })
                .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
                .ToListAsync();

            var monthlyLookup = monthlyCounts.ToDictionary(
                m => new DateTime(m.Year, m.Month, 1),
                m => m.Count);

            var appointmentsByMonth = months.Select(m => new
            {
                month = m.ToString("yyyy-MM"),
                count = monthlyLookup.TryGetValue(m, out var c) ? c : 0,
            }).ToList();

            return new
            {
                totalAppointments = total,
                byStatus = new { booked, completed, cancelled, noShow = 0 },
                completionRate,
                cancellationRate,
                topBusinessesByVolume,
                topBusinessesByCompletion,
                appointmentsByMonth,
            };
        }

        public async Task<object> GetReviewAnalyticsAsync()
        {
            var now = DateTime.UtcNow;

            var totalReviews = await _context.Reviews.CountAsync(r => !r.IsRemoved);

            var platformAverageRating = totalReviews > 0
                ? Math.Round(await _context.Reviews
                    .Where(r => !r.IsRemoved)
                    .AverageAsync(r => (double)r.Rating), 1)
                : 0.0;

            var ratingGroups = await _context.Reviews
                .Where(r => !r.IsRemoved)
                .GroupBy(r => r.Rating)
                .Select(g => new { Star = g.Key, Count = g.Count() })
                .ToListAsync();

            var ratingDistribution = new Dictionary<string, int>
            {
                ["1"] = ratingGroups.FirstOrDefault(g => g.Star == 1)?.Count ?? 0,
                ["2"] = ratingGroups.FirstOrDefault(g => g.Star == 2)?.Count ?? 0,
                ["3"] = ratingGroups.FirstOrDefault(g => g.Star == 3)?.Count ?? 0,
                ["4"] = ratingGroups.FirstOrDefault(g => g.Star == 4)?.Count ?? 0,
                ["5"] = ratingGroups.FirstOrDefault(g => g.Star == 5)?.Count ?? 0,
            };

            var topByCount = await _context.Reviews
                .Where(r => !r.IsRemoved)
                .GroupBy(r => r.BusinessId)
                .Select(g => new
                {
                    BusinessId    = g.Key,
                    ReviewCount   = g.Count(),
                    AverageRating = Math.Round(g.Average(r => (double)r.Rating), 1),
                })
                .OrderByDescending(x => x.ReviewCount)
                .Take(10)
                .ToListAsync();

            var topCountIds = topByCount.Select(x => x.BusinessId).ToList();
            var topCountBusinesses = await _context.Businesses
                .Where(b => topCountIds.Contains(b.Id))
                .Select(b => new { b.Id, b.Name, b.Slug })
                .ToListAsync();
            var topCountMap = topCountBusinesses.ToDictionary(b => b.Id);

            var topBusinessesByReviewCount = topByCount
                .Where(x => topCountMap.ContainsKey(x.BusinessId))
                .Select(x => new
                {
                    businessId    = x.BusinessId,
                    name          = topCountMap[x.BusinessId].Name,
                    slug          = topCountMap[x.BusinessId].Slug,
                    reviewCount   = x.ReviewCount,
                    averageRating = x.AverageRating,
                })
                .ToList();

            var ratedCandidates = await _context.Reviews
                .Where(r => !r.IsRemoved)
                .GroupBy(r => r.BusinessId)
                .Select(g => new
                {
                    BusinessId    = g.Key,
                    ReviewCount   = g.Count(),
                    AverageRating = Math.Round(g.Average(r => (double)r.Rating), 1),
                })
                .Where(x => x.ReviewCount >= 3)
                .ToListAsync();

            var ratedIds = ratedCandidates.Select(x => x.BusinessId).ToList();
            var ratedBusinesses = await _context.Businesses
                .Where(b => ratedIds.Contains(b.Id))
                .Select(b => new { b.Id, b.Name, b.Slug })
                .ToListAsync();
            var ratedMap = ratedBusinesses.ToDictionary(b => b.Id);

            var topRatedBusinesses = ratedCandidates
                .Where(x => ratedMap.ContainsKey(x.BusinessId))
                .OrderByDescending(x => x.AverageRating)
                .Take(5)
                .Select(x => new
                {
                    businessId    = x.BusinessId,
                    name          = ratedMap[x.BusinessId].Name,
                    slug          = ratedMap[x.BusinessId].Slug,
                    reviewCount   = x.ReviewCount,
                    averageRating = x.AverageRating,
                })
                .ToList();

            var lowestRatedBusinesses = ratedCandidates
                .Where(x => ratedMap.ContainsKey(x.BusinessId))
                .OrderBy(x => x.AverageRating)
                .Take(5)
                .Select(x => new
                {
                    businessId    = x.BusinessId,
                    name          = ratedMap[x.BusinessId].Name,
                    slug          = ratedMap[x.BusinessId].Slug,
                    reviewCount   = x.ReviewCount,
                    averageRating = x.AverageRating,
                })
                .ToList();

            var totalFlagged      = await _context.Reviews.CountAsync(r => r.IsFlagged || r.IsRemoved);
            var pendingFlags      = await _context.Reviews.CountAsync(r => r.IsFlagged && r.ResolvedAt == null);
            var resolvedRemoved   = await _context.Reviews.CountAsync(r => r.IsRemoved && r.ResolvedAt != null);
            var resolvedDismissed = await _context.Reviews.CountAsync(r => !r.IsFlagged && r.ResolvedAt != null && !r.IsRemoved);

            var months = Enumerable.Range(0, 12)
                .Select(i => new DateTime(now.Year, now.Month, 1).AddMonths(-11 + i))
                .ToList();

            var rangeStart = months.First();
            var rangeEnd   = months.Last().AddMonths(1);

            var monthlyReviews = await _context.Reviews
                .Where(r => !r.IsRemoved && r.CreatedAt >= rangeStart && r.CreatedAt < rangeEnd)
                .GroupBy(r => new { r.CreatedAt.Year, r.CreatedAt.Month })
                .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
                .ToListAsync();

            var monthlyLookup = monthlyReviews.ToDictionary(
                m => new DateTime(m.Year, m.Month, 1),
                m => m.Count);

            var reviewsByMonth = months.Select(m => new
            {
                month = m.ToString("yyyy-MM"),
                count = monthlyLookup.TryGetValue(m, out var c) ? c : 0,
            }).ToList();

            return new
            {
                totalReviews,
                platformAverageRating,
                ratingDistribution,
                topBusinessesByReviewCount,
                topRatedBusinesses,
                lowestRatedBusinesses,
                flagStats = new
                {
                    totalFlagged,
                    pendingFlags,
                    resolvedRemoved,
                    resolvedDismissed,
                },
                reviewsByMonth,
            };
        }

        // ── Category Requests ─────────────────────────────────────────────────

        public async Task<IEnumerable<AdminCategoryRequestDTO>> GetPendingCategoryRequestsAsync()
        {
            var requests = await _context.CategoryRequests
                .Where(r => r.Status == CategoryRequestStatus.Pending)
                .Include(r => r.RequestedBy)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            var businessIds = requests
                .Where(r => r.BusinessId.HasValue)
                .Select(r => r.BusinessId!.Value)
                .Distinct()
                .ToList();

            var businesses = businessIds.Count > 0
                ? await _context.Businesses
                    .Where(b => businessIds.Contains(b.Id))
                    .Select(b => new { b.Id, b.Name })
                    .ToListAsync()
                : [];

            return requests.Select(r =>
            {
                var biz = r.BusinessId.HasValue
                    ? businesses.FirstOrDefault(b => b.Id == r.BusinessId.Value)
                    : null;

                return new AdminCategoryRequestDTO
                {
                    Id             = r.Id,
                    Description    = r.Description,
                    AiSuggestedName = r.AiSuggestedName,
                    AiSuggestedIcon = r.AiSuggestedIcon,
                    Status         = r.Status.ToString(),
                    CreatedAt      = r.CreatedAt,
                    RequesterName  = r.RequestedBy?.Name ?? "Unknown",
                    RequesterEmail = r.RequestedBy?.Email ?? "",
                    BusinessId     = r.BusinessId,
                    BusinessName   = biz?.Name,
                };
            });
        }

        public async Task<(Guid CategoryId, string CategoryName)> ApproveCategoryRequestAsync(
            Guid id, string? categoryName, string? iconName)
        {
            var request = await _context.CategoryRequests.FindAsync(id)
                ?? throw new KeyNotFoundException("Request not found.");

            if (request.Status != CategoryRequestStatus.Pending)
                throw new InvalidOperationException("Request is no longer pending.");

            // Fall back to AI suggestion if caller didn't supply a name
            var resolvedName = (categoryName?.Trim().Length > 0 ? categoryName.Trim()
                : request.AiSuggestedName?.Trim() ?? "").Trim();

            if (string.IsNullOrEmpty(resolvedName))
                throw new ArgumentException("A category name is required.");

            categoryName = resolvedName;

            // Also fall back icon name to AI suggestion
            iconName ??= request.AiSuggestedIcon?.Trim();

            var exists = await _context.Categories.AnyAsync(c => c.Name == categoryName);
            if (exists)
                throw new InvalidOperationException($"A category named '{categoryName}' already exists.");

            var category = new Category
            {
                Id       = Guid.NewGuid(),
                Name     = categoryName,
                IconName = iconName,
            };
            _context.Categories.Add(category);

            if (request.BusinessId.HasValue)
            {
                var servicesToUpdate = await _context.Services
                    .Where(s => s.BusinessId == request.BusinessId.Value && s.CategoryId == UncategorizedId)
                    .ToListAsync();

                foreach (var svc in servicesToUpdate)
                    svc.CategoryId = category.Id;
            }

            request.Status = CategoryRequestStatus.Approved;
            await _context.SaveChangesAsync();

            return (category.Id, category.Name);
        }

        public async Task RejectCategoryRequestAsync(Guid id)
        {
            var request = await _context.CategoryRequests.FindAsync(id)
                ?? throw new KeyNotFoundException("Request not found.");

            if (request.Status != CategoryRequestStatus.Pending)
                throw new InvalidOperationException("Request is no longer pending.");

            request.Status = CategoryRequestStatus.Rejected;
            await _context.SaveChangesAsync();
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private static string AnonymizeName(string? fullName)
        {
            if (string.IsNullOrWhiteSpace(fullName)) return "Anonymous";
            var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 1) return parts[0];
            return $"{parts[0]} {parts[^1][0]}.";
        }
    }
}
