using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("businesses")]
    public class BusinessController : ControllerBase
    {
        private readonly IBusinessRepository _businessRepository;
        private readonly IBusinessInvitationRepository _businessInvitationRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IStaffRepository _staffRepository;

        public BusinessController(
            IBusinessRepository businessRepository,
            IBusinessInvitationRepository businessInvitationRepository,
            IServiceRepository serviceRepository,
            IStaffRepository staffRepository)
        {
            _businessRepository = businessRepository;
            _businessInvitationRepository = businessInvitationRepository;
            _serviceRepository = serviceRepository;
            _staffRepository = staffRepository;
        }

        // Define endpoints for business operations here

        [Authorize]
        [HttpPost]
        [EndpointSummary("Create Business")]
        [EndpointDescription("Create a new business. The authenticated user becomes the business owner. " +
            "Required fields: name (string, 1-200 chars), address (string, 1-500 chars). Optional: phone (string), description (string). " +
            "Example: { \"name\": \"John's Salon\", \"address\": \"123 Main St\", \"phone\": \"+1-555-0123\", \"description\": \"Professional hair salon\" }")]
        public async Task<IActionResult> CreateBusiness([FromBody] CreateBusinessDTO createBusinessDto)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString == null) return Unauthorized();
                Guid userId = Guid.Parse(userIdString);

                var business = await _businessRepository.CreateBusinessAsync(userId, createBusinessDto);
                return CreatedAtAction(nameof(CreateBusiness), new { id = business.Id }, business);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("{id}/invite")]
        [EndpointSummary("Invite Worker to Business")]
        [EndpointDescription("Send an invitation to a worker (by email) to join your business as a partner. " +
            "Invitation expires in 7 days. Fields: workerEmail (string, valid email), message (string, optional, up to 500 chars). " +
            "Example: { \"workerEmail\": \"worker@example.com\", \"message\": \"Would like to have you on our team!\" }. " +
            "Authorization: Only the business owner can send invitations.")]
        public async Task<IActionResult> InviteWorker(Guid id, [FromBody] InviteWorkerDTO inviteWorkerDto)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString == null) return Unauthorized();
                Guid userId = Guid.Parse(userIdString);

                var invitation = await _businessInvitationRepository.InviteWorkerAsync(id, userId, inviteWorkerDto);
                return Ok(invitation);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpGet("by-slug/{slug}")]
        [EndpointSummary("Get Business by Slug")]
        [EndpointDescription("Retrieve full business information by URL slug (e.g. 'johns-barbershop'). Returns 404 for unknown slugs, 410 if suspended. Authorization: Public.")]
        public async Task<IActionResult> GetBusinessBySlug(string slug)
        {
            try
            {
                var business = await _businessRepository.GetBusinessBySlugAsync(slug);
                if (business.IsSuspended)
                {
                    Response.Headers["Cache-Control"] = "no-store";
                    return StatusCode(503, new { error = "suspended" });
                }
                return Ok(business);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpGet("{id}")]
        [EndpointSummary("Get Business Details")]
        [EndpointDescription("Retrieve full business information including name, description, address, phone, and categories. " +
            "Example ID: 550e8400-e29b-41d4-a716-446655440000. Returns 503 if suspended. Authorization: Public — no authentication required.")]
        public async Task<IActionResult> GetBusinessById(Guid id)
        {
            try
            {
                var business = await _businessRepository.GetBusinessByIdAsync(id);
                if (business.IsSuspended)
                {
                    Response.Headers["Cache-Control"] = "no-store";
                    return StatusCode(503, new { error = "suspended" });
                }
                return Ok(business);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("my")]
        [EndpointSummary("List My Businesses")]
        [EndpointDescription("Retrieve all businesses owned by the authenticated user.")]
        public async Task<IActionResult> GetMyBusinesses()
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString == null) return Unauthorized();
                Guid userId = Guid.Parse(userIdString);

                var businesses = await _businessRepository.GetBusinessesByOwnerAsync(userId);
                return Ok(businesses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet]
        [EndpointSummary("List All Businesses")]
        [EndpointDescription("Retrieve a list of all businesses in the system. Returns business summary information for each business. " +
            "Includes: ID, name, address, phone, owner ID. Authorization: Any authenticated user can list businesses.")]
        public async Task<IActionResult> GetAllBusinesses([FromQuery] Guid? categoryId = null)
        {
            try
            {
                var businesses = await _businessRepository.GetAllBusinessesAsync(categoryId);
                return Ok(businesses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("{id}")]
        [EndpointSummary("Update Business Information")]
        [EndpointDescription("Update business details. Supports partial updates - only include fields to change. " +
            "Optional fields: name (string, 1-200 chars), address (string, 1-500 chars), phone (string), description (string). " +
            "Example: { \"phone\": \"+1-555-0456\", \"description\": \"Now open 7 days a week\" }. " +
            "Authorization: Only the business owner can update the business.")]
        public async Task<IActionResult> UpdateBusiness(Guid id, [FromBody] UpdateBusinessDTO updateBusinessDto)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString == null) return Unauthorized();
                Guid userId = Guid.Parse(userIdString);

                var business = await _businessRepository.UpdateBusinessAsync(id, userId, updateBusinessDto);
                return Ok(business);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("{businessId}/services")]
        [EndpointSummary("Create Service")]
        [EndpointDescription("Create a new service for a business. Service is assigned to an existing business partner (employee). " +
            "Required fields: name (string, 1-200 chars), duration (integer, minutes, > 0), price (decimal, >= 0). " +
            "Optional: description (string). userId must reference an existing business partner. " +
            "Example: { \"name\": \"Haircut\", \"description\": \"Professional haircut\", \"duration\": 30, \"price\": 25.00, \"userId\": \"550e8400-e29b-41d4-a716-446655440000\" }. " +
            "Authorization: Only the business owner can create services.")]
        public async Task<IActionResult> CreateService(Guid businessId, [FromBody] CreateServiceDTO createServiceDto)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString == null) return Unauthorized();
                Guid userId = Guid.Parse(userIdString);

                var service = await _serviceRepository.CreateServiceAsync(businessId, userId, createServiceDto);
                return CreatedAtAction(nameof(CreateService), new { id = service.Id }, service);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpGet("{businessId}/services")]
        [EndpointSummary("List Business Services")]
        [EndpointDescription("Retrieve all services offered by a specific business. Returns list of services with details: " +
            "name, description, duration (minutes), price, assigned partner (userId). Useful for customers browsing available services. " +
            "Authorization: Public — no authentication required.")]
        public async Task<IActionResult> GetServices(Guid businessId)
        {
            try
            {
                var services = await _serviceRepository.GetServicesForBusinessAsync(businessId);
                return Ok(services);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("{businessId}/services/{serviceId}")]
        [EndpointSummary("Update Service")]
        [EndpointDescription("Update an existing service. Supports partial updates - only include fields to change. " +
            "Optional fields: name (string, 1-200 chars), description (string), duration (integer, minutes, > 0), price (decimal, >= 0), " +
            "userId (Guid, must be existing business partner for reassignment). " +
            "Example: { \"duration\": 45, \"price\": 35.00 }. " +
            "Validation: Service must belong to the specified business. Authorization: Only the business owner can update services.")]
        public async Task<IActionResult> UpdateService(Guid businessId, Guid serviceId, [FromBody] UpdateServiceDTO updateServiceDto)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString == null) return Unauthorized();
                Guid userId = Guid.Parse(userIdString);

                var service = await _serviceRepository.UpdateServiceAsync(businessId, serviceId, userId, updateServiceDto);
                return Ok(service);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("{id}/upload-logo")]
        [EndpointSummary("Upload Business Logo")]
        [EndpointDescription("Upload a logo image (jpg, png, webp) for the business. Stored on local disk. Authorization: Only the business owner.")]
        public async Task<IActionResult> UploadLogo(Guid id, IFormFile file)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString == null) return Unauthorized();
                Guid userId = Guid.Parse(userIdString);

                if (file == null || file.Length == 0)
                    return BadRequest(new { error = "No file provided." });

                var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
                if (!allowed.Contains(file.ContentType.ToLower()))
                    return BadRequest(new { error = "Only jpg, png, and webp images are accepted." });

                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "logos");
                Directory.CreateDirectory(uploadsPath);

                var ext = Path.GetExtension(file.FileName).ToLower();
                var fileName = $"{id}-{Guid.NewGuid()}{ext}";
                var filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                    await file.CopyToAsync(stream);

                var logoUrl = $"/uploads/logos/{fileName}";
                var business = await _businessRepository.UpdateBusinessLogoAsync(id, userId, logoUrl);
                return Ok(business);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("{id}/upload-banner")]
        [EndpointSummary("Upload Business Banner")]
        [EndpointDescription("Upload a banner image (jpg, png, webp) for the business. Stored on local disk. Authorization: Only the business owner.")]
        public async Task<IActionResult> UploadBanner(Guid id, IFormFile file)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString == null) return Unauthorized();
                Guid userId = Guid.Parse(userIdString);

                if (file == null || file.Length == 0)
                    return BadRequest(new { error = "No file provided." });

                var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
                if (!allowed.Contains(file.ContentType.ToLower()))
                    return BadRequest(new { error = "Only jpg, png, and webp images are accepted." });

                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "banners");
                Directory.CreateDirectory(uploadsPath);

                var ext = Path.GetExtension(file.FileName).ToLower();
                var fileName = $"{id}-{Guid.NewGuid()}{ext}";
                var filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                    await file.CopyToAsync(stream);

                var bannerUrl = $"/uploads/banners/{fileName}";
                var business = await _businessRepository.UpdateBusinessBannerAsync(id, userId, bannerUrl);
                return Ok(business);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpPost("{id}/upload-search-image")]
        [EndpointSummary("Upload Business Search Image")]
        [EndpointDescription("Upload a search/discovery card image (jpg, png, webp) for the business. Shown in search results instead of the logo. Authorization: Only the business owner.")]
        public async Task<IActionResult> UploadSearchImage(Guid id, IFormFile file)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString == null) return Unauthorized();
                Guid userId = Guid.Parse(userIdString);

                if (file == null || file.Length == 0)
                    return BadRequest(new { error = "No file provided." });

                var allowed = new[] { "image/jpeg", "image/png", "image/webp" };
                if (!allowed.Contains(file.ContentType.ToLower()))
                    return BadRequest(new { error = "Only jpg, png, and webp images are accepted." });

                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "search-images");
                Directory.CreateDirectory(uploadsPath);

                var ext = Path.GetExtension(file.FileName).ToLower();
                var fileName = $"{id}-{Guid.NewGuid()}{ext}";
                var filePath = Path.Combine(uploadsPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                    await file.CopyToAsync(stream);

                var searchImageUrl = $"/uploads/search-images/{fileName}";
                var business = await _businessRepository.UpdateBusinessSearchImageAsync(id, userId, searchImageUrl);
                return Ok(business);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("{businessId}/services/{serviceId}")]
        [EndpointSummary("Delete Service")]
        [EndpointDescription("Delete a service from the business. Authorization: Only the business owner can delete services.")]
        public async Task<IActionResult> DeleteService(Guid businessId, Guid serviceId)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString == null) return Unauthorized();
                Guid userId = Guid.Parse(userIdString);

                await _serviceRepository.DeleteServiceAsync(businessId, serviceId, userId);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // ── Staff Management ─────────────────────────────────────────────────

        [Authorize]
        [HttpGet("{businessId}/staff")]
        [EndpointSummary("List Staff Members")]
        [EndpointDescription("Returns all accepted staff members for the business with their assigned service names. Authorization: Only the business owner.")]
        public async Task<IActionResult> GetStaff(Guid businessId)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString == null) return Unauthorized();
                Guid userId = Guid.Parse(userIdString);

                var staff = await _staffRepository.GetStaffAsync(businessId, userId);
                return Ok(staff);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("{businessId}/invitations")]
        [EndpointSummary("List Pending Invitations")]
        [EndpointDescription("Returns all pending invitations sent by this business. Authorization: Only the business owner.")]
        public async Task<IActionResult> GetPendingInvitations(Guid businessId)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString == null) return Unauthorized();
                Guid userId = Guid.Parse(userIdString);

                var invitations = await _staffRepository.GetPendingInvitationsAsync(businessId, userId);
                return Ok(invitations);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("{businessId}/invitations/{invitationId}")]
        [EndpointSummary("Cancel Invitation")]
        [EndpointDescription("Cancels a pending invitation. Authorization: Only the business owner.")]
        public async Task<IActionResult> CancelInvitation(Guid businessId, Guid invitationId)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString == null) return Unauthorized();
                Guid userId = Guid.Parse(userIdString);

                await _staffRepository.CancelInvitationAsync(businessId, invitationId, userId);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("{businessId}/staff/{userId}")]
        [EndpointSummary("Remove Staff Member")]
        [EndpointDescription("Soft-deletes a staff member (status = Removed) and unlinks them from all services. Authorization: Only the business owner.")]
        public async Task<IActionResult> RemoveStaff(Guid businessId, Guid userId)
        {
            try
            {
                var callerIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (callerIdString == null) return Unauthorized();
                Guid callerId = Guid.Parse(callerIdString);

                await _staffRepository.RemoveStaffAsync(businessId, userId, callerId);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("{businessId}/staff/{userId}/services")]
        [EndpointSummary("Get Staff Member Services")]
        [EndpointDescription("Returns the list of service IDs assigned to a staff member. Authorization: Only the business owner.")]
        public async Task<IActionResult> GetStaffServices(Guid businessId, Guid userId)
        {
            try
            {
                var callerIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (callerIdString == null) return Unauthorized();
                Guid callerId = Guid.Parse(callerIdString);

                var serviceIds = await _staffRepository.GetStaffServicesAsync(businessId, userId, callerId);
                return Ok(serviceIds);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("{businessId}/staff/{userId}/services")]
        [EndpointSummary("Update Staff Member Services")]
        [EndpointDescription("Replaces the full list of service assignments for a staff member. Body: array of service GUIDs. Authorization: Only the business owner.")]
        public async Task<IActionResult> UpdateStaffServices(Guid businessId, Guid userId, [FromBody] List<Guid> serviceIds)
        {
            try
            {
                var callerIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (callerIdString == null) return Unauthorized();
                Guid callerId = Guid.Parse(callerIdString);

                await _staffRepository.UpdateStaffServicesAsync(businessId, userId, callerId, serviceIds);
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("{businessId}/staff/{userId}/report")]
        [EndpointSummary("Get Staff Member Report")]
        [EndpointDescription("Returns performance analytics for a staff member. Optional query params: startDate, endDate (ISO 8601). Defaults to current month. Authorization: Only the business owner.")]
        public async Task<IActionResult> GetStaffReport(Guid businessId, Guid userId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var callerIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (callerIdString == null) return Unauthorized();
                Guid callerId = Guid.Parse(callerIdString);

                var report = await _staffRepository.GetStaffReportAsync(businessId, userId, callerId, startDate, endDate);
                return Ok(report);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpPatch("{id}/notification-settings")]
        [EndpointSummary("Update Business Notification Settings")]
        [EndpointDescription("Allows the business owner to opt in or out of in-app notifications for new bookings and cancellations. " +
            "Fields are optional — only provided fields are updated. Authorization: Only the business owner.")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateNotificationSettings(
            Guid id,
            [FromBody] UpdateBusinessNotificationSettingsDTO dto)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userIdString == null) return Unauthorized();
                Guid userId = Guid.Parse(userIdString);

                await _businessRepository.UpdateNotificationSettingsAsync(
                    id, userId, dto.NotifyOnNewBooking, dto.NotifyOnCancellation);

                // Return current values by fetching the updated entity
                var business = await _businessRepository.GetBusinessEntityByIdAsync(id);
                return Ok(new
                {
                    business!.NotifyOnNewBooking,
                    business.NotifyOnCancellation,
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}