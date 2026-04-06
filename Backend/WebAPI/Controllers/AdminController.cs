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

        /// <summary>GET /admin/stats — platform-wide counts for the admin dashboard.</summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalBusinesses = await _context.Businesses.CountAsync();
            var totalAppointments = await _context.Appointments.CountAsync();
            var totalReviews = await _context.Reviews.CountAsync();
            var pendingFlaggedReviews = await _context.Reviews.CountAsync(r => r.IsFlagged);

            return Ok(new
            {
                totalUsers,
                totalBusinesses,
                totalAppointments,
                totalReviews,
                pendingFlaggedReviews,
            });
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
