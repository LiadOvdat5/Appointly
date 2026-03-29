using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Utilities;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        private Guid? GetCurrentUserId() => User.GetUserId();

        /// <summary>
        /// Get a customer activity report for a date range
        /// </summary>
        [HttpGet("customer")]
        [EndpointSummary("Get Customer Report")]
        [EndpointDescription("Returns total bookings, spending, and favourite business/service for the customer's dashboard. " +
            "Defaults to the current calendar month when no date range is provided.")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<CustomerReportDTO>> GetCustomerReport(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
                return Unauthorized("User is not authenticated.");

            var now = DateTime.UtcNow;
            var start = startDate ?? new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var end = endDate ?? new DateTime(now.Year, now.Month, DateTime.DaysInMonth(now.Year, now.Month), 23, 59, 59, DateTimeKind.Utc);

            if (start > end)
                return BadRequest("startDate must be before endDate.");

            try
            {
                var report = await _reportService.GetCustomerReportAsync(userId.Value, start, end);
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"An error occurred while generating the report: {ex.Message}");
            }
        }

        /// <summary>
        /// Get a business performance report for a date range
        /// </summary>
        [HttpGet("business/{businessId}")]
        [EndpointSummary("Get Business Report")]
        [EndpointDescription("Returns total appointments, revenue, and top service for the business owner's dashboard. " +
            "Defaults to the current calendar month when no date range is provided. " +
            "Authorization: Only the business owner can access this data.")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BusinessReportDTO>> GetBusinessReport(
            Guid businessId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
                return Unauthorized("User is not authenticated.");

            // Default to current calendar month
            var now = DateTime.UtcNow;
            var start = startDate ?? new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var end = endDate ?? new DateTime(now.Year, now.Month, DateTime.DaysInMonth(now.Year, now.Month), 23, 59, 59, DateTimeKind.Utc);

            if (start > end)
                return BadRequest("startDate must be before endDate.");

            try
            {
                var report = await _reportService.GetBusinessReportAsync(businessId, userId.Value, start, end);
                return Ok(report);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"An error occurred while generating the report: {ex.Message}");
            }
        }
    }
}
