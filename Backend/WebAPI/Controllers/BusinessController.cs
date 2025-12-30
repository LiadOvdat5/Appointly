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

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllBusinesses()
        {
            try
            {
                var businesses = await _businessRepository.GetAllBusinessesAsync();
                return Ok(businesses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpPut("{id}")]
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
    }
}