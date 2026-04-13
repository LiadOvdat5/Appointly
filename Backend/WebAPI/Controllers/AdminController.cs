using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebAPI.Data;
using WebAPI.DTOs;
using WebAPI.Interfaces;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("admin")]
    [Authorize(Roles = "admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminRepository _adminRepository;
        private readonly DemoDataSeeder _demoDataSeeder;

        public AdminController(IAdminRepository adminRepository, DemoDataSeeder demoDataSeeder)
        {
            _adminRepository = adminRepository;
            _demoDataSeeder = demoDataSeeder;
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

            var result = await _adminRepository.GetUsersPagedAsync(search, role, page, pageSize);
            return Ok(result);
        }

        /// <summary>POST /admin/users/{userId}/suspend — suspend a user account.</summary>
        [HttpPost("users/{userId:guid}/suspend")]
        public async Task<IActionResult> SuspendUser(Guid userId, [FromBody] SuspendUserDTO dto)
        {
            try
            {
                await _adminRepository.SuspendUserAsync(userId, dto.Reason);
                return Ok(new { userId, isSuspended = true, reason = dto.Reason?.Trim() });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
        }

        /// <summary>POST /admin/users/{userId}/reactivate — lift a suspension.</summary>
        [HttpPost("users/{userId:guid}/reactivate")]
        public async Task<IActionResult> ReactivateUser(Guid userId)
        {
            try
            {
                await _adminRepository.ReactivateUserAsync(userId);
                return Ok(new { userId, isSuspended = false });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
        }

        /// <summary>GET /admin/stats — platform-wide counts for the admin dashboard.</summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _adminRepository.GetStatsAsync();
            return Ok(stats);
        }

        /// <summary>GET /admin/reviews/flagged — all flagged reviews not yet resolved.</summary>
        [HttpGet("reviews/flagged")]
        public async Task<IActionResult> GetFlaggedReviews()
        {
            var result = await _adminRepository.GetFlaggedReviewsAsync();
            return Ok(result);
        }

        /// <summary>POST /admin/reviews/{reviewId}/resolve — remove or dismiss a flagged review.</summary>
        [HttpPost("reviews/{reviewId:guid}/resolve")]
        public async Task<IActionResult> ResolveReview(Guid reviewId, [FromBody] ResolveReviewDTO dto)
        {
            if (dto.Action != "remove" && dto.Action != "dismiss")
                return BadRequest(new { error = "Action must be 'remove' or 'dismiss'." });

            var adminIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var adminId = adminIdClaim != null && Guid.TryParse(adminIdClaim, out var aid) ? aid : (Guid?)null;

            try
            {
                await _adminRepository.ResolveReviewAsync(reviewId, dto.Action, adminId);
                return Ok(new { reviewId, action = dto.Action });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
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

            var result = await _adminRepository.GetBusinessesPagedAsync(search, page, pageSize);
            return Ok(result);
        }

        /// <summary>POST /admin/businesses/{businessId}/suspend — suspend a business.</summary>
        [HttpPost("businesses/{businessId:guid}/suspend")]
        public async Task<IActionResult> SuspendBusiness(Guid businessId, [FromBody] SuspendBusinessDTO dto)
        {
            try
            {
                await _adminRepository.SuspendBusinessAsync(businessId, dto.Reason);
                return Ok(new { businessId, isSuspended = true, reason = dto.Reason?.Trim() });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
        }

        /// <summary>POST /admin/businesses/{businessId}/reactivate — lift a business suspension.</summary>
        [HttpPost("businesses/{businessId:guid}/reactivate")]
        public async Task<IActionResult> ReactivateBusiness(Guid businessId)
        {
            try
            {
                await _adminRepository.ReactivateBusinessAsync(businessId);
                return Ok(new { businessId, isSuspended = false });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
        }

        /// <summary>GET /admin/appointments/analytics — platform-wide appointment analytics.</summary>
        [HttpGet("appointments/analytics")]
        public async Task<IActionResult> GetAppointmentAnalytics()
        {
            var result = await _adminRepository.GetAppointmentAnalyticsAsync();
            return Ok(result);
        }

        /// <summary>GET /admin/reviews/analytics — platform-wide review analytics.</summary>
        [HttpGet("reviews/analytics")]
        public async Task<IActionResult> GetReviewAnalytics()
        {
            var result = await _adminRepository.GetReviewAnalyticsAsync();
            return Ok(result);
        }

        /// <summary>GET /admin/category-requests — all Pending requests with requester + business info.</summary>
        [HttpGet("category-requests")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var result = await _adminRepository.GetPendingCategoryRequestsAsync();
            return Ok(result);
        }

        /// <summary>POST /admin/category-requests/{id}/approve — create category, update services, mark Approved.</summary>
        [HttpPost("category-requests/{id:guid}/approve")]
        public async Task<IActionResult> ApproveRequest(Guid id, [FromBody] ApproveCategoryRequestDTO dto)
        {
            try
            {
                var (categoryId, categoryName) = await _adminRepository.ApproveCategoryRequestAsync(
                    id, dto.Name, dto.IconName);

                return Ok(new { categoryId, categoryName });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>POST /admin/seed-demo — seed realistic demo data (idempotent). Requires admin role.</summary>
        [HttpPost("seed-demo")]
        public async Task<IActionResult> SeedDemo()
        {
            try
            {
                await _demoDataSeeder.SeedAsync();
                return Ok(new { message = "Demo data seeded successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>POST /admin/category-requests/{id}/reject — marks request Rejected.</summary>
        [HttpPost("category-requests/{id:guid}/reject")]
        public async Task<IActionResult> RejectRequest(Guid id)
        {
            try
            {
                await _adminRepository.RejectCategoryRequestAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
        }
    }
}
