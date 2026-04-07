using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("admin")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private static readonly Guid UncategorizedId = Guid.Parse("11111111-1111-1111-1111-111111111111");

        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>GET /admin/users — paginated list of all users, filterable by name/email and role.</summary>
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers(
            [FromQuery] string? search,
            [FromQuery] string? role,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                query = query.Where(u =>
                    u.Name.ToLower().Contains(term) ||
                    u.Email.ToLower().Contains(term));
            }

            if (!string.IsNullOrWhiteSpace(role) &&
                Enum.TryParse<WebAPI.Models.UserRole>(role, ignoreCase: true, out var parsedRole))
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

            return Ok(new AdminUsersPageDTO
            {
                Users = users,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages,
            });
        }

        /// <summary>POST /admin/users/{userId}/suspend — suspend a user account.</summary>
        [HttpPost("users/{userId:guid}/suspend")]
        public async Task<IActionResult> SuspendUser(Guid userId, [FromBody] SuspendUserDTO dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { error = "User not found." });
            if (user.IsSuspended) return Conflict(new { error = "User is already suspended." });

            user.IsSuspended = true;
            user.SuspendedReason = dto.Reason?.Trim();
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { userId, isSuspended = true, reason = user.SuspendedReason });
        }

        /// <summary>POST /admin/users/{userId}/reactivate — lift a suspension.</summary>
        [HttpPost("users/{userId:guid}/reactivate")]
        public async Task<IActionResult> ReactivateUser(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound(new { error = "User not found." });
            if (!user.IsSuspended) return Conflict(new { error = "User is not suspended." });

            user.IsSuspended = false;
            user.SuspendedReason = null;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { userId, isSuspended = false });
        }

        /// <summary>GET /admin/stats — platform-wide counts for the admin dashboard.</summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalBusinesses = await _context.Businesses.CountAsync();
            var totalAppointments = await _context.Appointments.CountAsync();
            var totalReviews = await _context.Reviews.CountAsync();
            var pendingFlaggedReviews = await _context.Reviews.CountAsync(r => r.IsFlagged && r.ResolvedAt == null);

            return Ok(new
            {
                totalUsers,
                totalBusinesses,
                totalAppointments,
                totalReviews,
                pendingFlaggedReviews,
            });
        }

        /// <summary>GET /admin/reviews/flagged — all flagged reviews not yet resolved.</summary>
        [HttpGet("reviews/flagged")]
        public async Task<IActionResult> GetFlaggedReviews()
        {
            var reviews = await _context.Reviews
                .Include(r => r.Customer)
                .Include(r => r.Business)
                .Where(r => r.IsFlagged && r.ResolvedAt == null)
                .OrderByDescending(r => r.FlaggedAt)
                .ToListAsync();

            var result = reviews.Select(r => new AdminFlaggedReviewDTO
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

            return Ok(result);
        }

        /// <summary>POST /admin/reviews/{reviewId}/resolve — remove or dismiss a flagged review.</summary>
        [HttpPost("reviews/{reviewId:guid}/resolve")]
        public async Task<IActionResult> ResolveReview(Guid reviewId, [FromBody] ResolveReviewDTO dto)
        {
            if (dto.Action != "remove" && dto.Action != "dismiss")
                return BadRequest(new { error = "Action must be 'remove' or 'dismiss'." });

            var review = await _context.Reviews.FindAsync(reviewId);
            if (review == null) return NotFound(new { error = "Review not found." });
            if (!review.IsFlagged) return Conflict(new { error = "Review is not flagged." });
            if (review.ResolvedAt != null) return Conflict(new { error = "Review has already been resolved." });

            var adminIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var adminId = adminIdClaim != null && Guid.TryParse(adminIdClaim, out var aid) ? aid : (Guid?)null;

            review.ResolvedAt = DateTime.UtcNow;
            review.ResolvedByAdminId = adminId;

            if (dto.Action == "remove")
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
            if (dto.Action == "remove")
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

            return Ok(new { reviewId, action = dto.Action });
        }

        /// <summary>GET /admin/businesses — paginated list of all businesses.</summary>
        [HttpGet("businesses")]
        public async Task<IActionResult> GetBusinesses(
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

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

            // Resolve category names from stored string IDs
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

            return Ok(new AdminBusinessesPageDTO
            {
                Businesses = result,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages,
            });
        }

        /// <summary>POST /admin/businesses/{businessId}/suspend — suspend a business.</summary>
        [HttpPost("businesses/{businessId:guid}/suspend")]
        public async Task<IActionResult> SuspendBusiness(Guid businessId, [FromBody] SuspendBusinessDTO dto)
        {
            var business = await _context.Businesses.FindAsync(businessId);
            if (business == null) return NotFound(new { error = "Business not found." });
            if (business.IsSuspended) return Conflict(new { error = "Business is already suspended." });

            business.IsSuspended = true;
            business.SuspendedReason = dto.Reason?.Trim();
            business.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { businessId, isSuspended = true, reason = business.SuspendedReason });
        }

        /// <summary>POST /admin/businesses/{businessId}/reactivate — lift a business suspension.</summary>
        [HttpPost("businesses/{businessId:guid}/reactivate")]
        public async Task<IActionResult> ReactivateBusiness(Guid businessId)
        {
            var business = await _context.Businesses.FindAsync(businessId);
            if (business == null) return NotFound(new { error = "Business not found." });
            if (!business.IsSuspended) return Conflict(new { error = "Business is not suspended." });

            business.IsSuspended = false;
            business.SuspendedReason = null;
            business.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { businessId, isSuspended = false });
        }

        private static string AnonymizeName(string? fullName)
        {
            if (string.IsNullOrWhiteSpace(fullName)) return "Anonymous";
            var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 1) return parts[0];
            return $"{parts[0]} {parts[^1][0]}.";
        }

        /// <summary>GET /admin/category-requests — all Pending requests with requester + business info.</summary>
        [HttpGet("category-requests")]
        public async Task<IActionResult> GetPendingRequests()
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

            var result = requests.Select(r =>
            {
                var biz = r.BusinessId.HasValue
                    ? businesses.FirstOrDefault(b => b.Id == r.BusinessId.Value)
                    : null;

                return new AdminCategoryRequestDTO
                {
                    Id = r.Id,
                    Description = r.Description,
                    AiSuggestedName = r.AiSuggestedName,
                    AiSuggestedIcon = r.AiSuggestedIcon,
                    Status = r.Status.ToString(),
                    CreatedAt = r.CreatedAt,
                    RequesterName = r.RequestedBy?.Name ?? "Unknown",
                    RequesterEmail = r.RequestedBy?.Email ?? "",
                    BusinessId = r.BusinessId,
                    BusinessName = biz?.Name,
                };
            });

            return Ok(result);
        }

        /// <summary>
        /// POST /admin/category-requests/{id}/approve
        /// Creates the category, updates the requester's business services, marks request Approved.
        /// </summary>
        [HttpPost("category-requests/{id:guid}/approve")]
        public async Task<IActionResult> ApproveRequest(Guid id, [FromBody] ApproveCategoryRequestDTO dto)
        {
            var request = await _context.CategoryRequests.FindAsync(id);
            if (request == null) return NotFound(new { error = "Request not found." });
            if (request.Status != CategoryRequestStatus.Pending)
                return Conflict(new { error = "Request is no longer pending." });

            var categoryName = (dto.Name?.Trim() ?? request.AiSuggestedName?.Trim() ?? "").Trim();
            if (string.IsNullOrEmpty(categoryName))
                return BadRequest(new { error = "A category name is required." });

            var iconName = dto.IconName?.Trim() ?? request.AiSuggestedIcon?.Trim();

            // Prevent duplicates
            var exists = await _context.Categories.AnyAsync(c => c.Name == categoryName);
            if (exists)
                return Conflict(new { error = $"A category named '{categoryName}' already exists." });

            // Create the new category
            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = categoryName,
                IconName = iconName,
            };
            _context.Categories.Add(category);

            // Update the requester's business services from Uncategorized → new category
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

            return Ok(new { categoryId = category.Id, categoryName = category.Name });
        }

        /// <summary>POST /admin/category-requests/{id}/reject — marks request Rejected.</summary>
        [HttpPost("category-requests/{id:guid}/reject")]
        public async Task<IActionResult> RejectRequest(Guid id)
        {
            var request = await _context.CategoryRequests.FindAsync(id);
            if (request == null) return NotFound(new { error = "Request not found." });
            if (request.Status != CategoryRequestStatus.Pending)
                return Conflict(new { error = "Request is no longer pending." });

            request.Status = CategoryRequestStatus.Rejected;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
