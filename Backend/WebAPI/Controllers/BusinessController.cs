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

        public BusinessController(
            IBusinessRepository businessRepository,
            IBusinessInvitationRepository businessInvitationRepository,
            IServiceRepository serviceRepository)
        {
            _businessRepository = businessRepository;
            _businessInvitationRepository = businessInvitationRepository;
            _serviceRepository = serviceRepository;
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

        [Authorize]
        [HttpGet("{id}")]
        [EndpointSummary("Get Business Details")]
        [EndpointDescription("Retrieve full business information including name, address, phone, owner ID, and list of partners. " +
            "Example ID: 550e8400-e29b-41d4-a716-446655440000. Authorization: Any authenticated user can view business details.")]
        public async Task<IActionResult> GetBusinessById(Guid id)
        {
            try
            {
                var business = await _businessRepository.GetBusinessByIdAsync(id);
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

        //[Authorize]
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

        [Authorize]
        [HttpGet("{businessId}/services")]
        [EndpointSummary("List Business Services")]
        [EndpointDescription("Retrieve all services offered by a specific business. Returns list of services with details: " +
            "name, description, duration (minutes), price, assigned partner (userId). Useful for customers browsing available services. " +
            "Authorization: Any authenticated user can view services.")]
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
    }
}