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

        public BusinessController(IBusinessRepository businessRepository)
        {
            _businessRepository = businessRepository;
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
    }
}