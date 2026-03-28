using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Models;
using WebAPI.Services;
using WebAPI.Utilities;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ScheduleController : ControllerBase
    {
        private readonly IServiceScheduleRepository _serviceScheduleRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly SlotGenerationService _slotGenerationService;

        public ScheduleController(
            IServiceScheduleRepository serviceScheduleRepository,
            IServiceRepository serviceRepository,
            SlotGenerationService slotGenerationService)
        {
            _serviceScheduleRepository = serviceScheduleRepository;
            _serviceRepository = serviceRepository;
            _slotGenerationService = slotGenerationService;
        }

        private Guid? GetCurrentUserId()
        {
            return User.GetUserId();
        }

        private static bool IsOwner(Service service, Guid userId)
        {
            return service.UserId == userId || (service.Business?.OwnerId == userId);
        }

        private async Task<Service?> GetServiceWithBusinessAsync(Guid serviceId)
        {
            return await _serviceRepository.GetByIdAsync(serviceId);
        }

        private async Task<(Service? service, ActionResult? errorResult)> AuthorizeServiceOwnerAsync(Guid serviceId)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
                return (null, Unauthorized("User is not authenticated."));

            var service = await GetServiceWithBusinessAsync(serviceId);
            if (service == null)
                return (null, NotFound($"Service not found: {serviceId}"));

            if (!IsOwner(service, userId.Value))
                return (null, Forbid());

            return (service, null);
        }

        /// <summary>
        /// Get available slots for a service
        /// </summary>
        [HttpGet("service/{serviceId}/slots")]
        [EndpointSummary("Get Service Slots")]
        [EndpointDescription("Retrieve all available appointment slots for a specific service. " +
            "Returns a list of time slots where appointments can be booked, respecting the service's duration and availability rules. " +
            "Each slot includes start time and end time. " +
            "Authorization: Authorized users can view any service's slots. " +
            "Example ID: 550e8400-e29b-41d4-a716-446655440000")]
        public async Task<ActionResult<List<ServiceScheduleDTO>>> GetServiceSlots(Guid serviceId)
        {
            try
            {
                var service = await _serviceRepository.GetByIdAsync(serviceId);
                if (service == null)
                    return NotFound($"Service not found: {serviceId}");

                var slots = await _serviceScheduleRepository.GetByServiceIdAsync(serviceId);
                var dtos = slots.Select(s => new ServiceScheduleDTO
                {
                    Id = s.Id,
                    ServiceId = s.ServiceId,
                    StartDateTime = s.StartDateTime,
                    EndDateTime = s.EndDateTime,
                    Status = s.Status,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt
                }).ToList();

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get available slots for a service within a date range
        /// </summary>
        [AllowAnonymous]
        [HttpGet("service/{serviceId}/slots/range")]
        [EndpointSummary("Get Service Slots by Date Range")]
        [EndpointDescription("Retrieve available slots for a service within a specified date range. " +
            "Query parameters: startDate (yyyy-MM-dd), endDate (yyyy-MM-dd). " +
            "Returns all slots that fall within the date range, useful for UI slot pickers. " +
            "Authorization: Authorized users can view any service's slots. " +
            "Example: /api/schedule/service/550e8400-e29b-41d4-a716-446655440000/slots/range?startDate=2026-01-10&endDate=2026-01-20")]
        public async Task<ActionResult<List<ServiceScheduleDTO>>> GetServiceSlotsByDateRange(
            Guid serviceId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var service = await _serviceRepository.GetByIdAsync(serviceId);
                if (service == null)
                    return NotFound($"Service not found: {serviceId}");

                var slots = await _serviceScheduleRepository.GetAvailableSlotsAsync(serviceId, startDate, endDate);
                var dtos = slots.Select(s => new ServiceScheduleDTO
                {
                    Id = s.Id,
                    ServiceId = s.ServiceId,
                    StartDateTime = s.StartDateTime,
                    EndDateTime = s.EndDateTime,
                    Status = s.Status,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt
                }).ToList();

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get all services for a business with their scheduling status
        /// </summary>
        [HttpGet("business/{businessId}/services-schedule")]
        [EndpointSummary("Get Business Services Schedule Status")]
        [EndpointDescription("Retrieve all services for a business with their slot generation status and configuration. " +
            "Returns service details including duration, timezone settings, and whether slots have been generated. " +
            "Useful for business owner dashboard showing scheduling status of all services. " +
            "Authorization: Authorized users can view any business's services.")]
        public async Task<ActionResult<object>> GetBusinessServicesScheduleStatus(Guid businessId)
        {
            try
            {
                var services = await _serviceRepository.GetServicesForBusinessAsync(businessId);
                var result = new List<object>();

                foreach (var service in services)
                {
                    var slots = await _serviceScheduleRepository.GetByServiceIdAsync(service.Id);
                    result.Add(new
                    {
                        service.Id,
                        service.Name,
                        service.Duration,
                        TotalSlots = slots.Count,
                        AvailableSlots = slots.Count(s => s.Status == ScheduleStatus.AVAILABLE),
                        BookedSlots = slots.Count(s => s.Status == ScheduleStatus.BOOKED),
                        BlockedSlots = slots.Count(s => s.Status == ScheduleStatus.BLOCKED),
                        LatestSlotDate = slots.Any() ? slots.Max(s => s.EndDateTime) : (DateTime?)null
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete available slot
        /// </summary>
        [HttpDelete("slot/{slotId}")]
        [EndpointSummary("Delete Available Slot")]
        [EndpointDescription("Delete a single available slot (must be unbooked/unblocked). " +
            "Returns 204 No Content on success. Useful for removing unavailable time periods. " +
            "Cannot delete slots that are already booked. " +
            "Authorization: Only business owners can delete slots for their services.")]
        public async Task<IActionResult> DeleteSlot(Guid slotId)
        {
            try
            {
                var slot = await _serviceScheduleRepository.GetByIdAsync(slotId);
                if (slot == null)
                    return NotFound($"Slot not found: {slotId}");

                var (_, error) = await AuthorizeServiceOwnerAsync(slot.ServiceId);
                if (error != null)
                    return error;

                if (slot.Status == ScheduleStatus.BOOKED)
                    return BadRequest("Cannot delete a booked slot");

                await _serviceScheduleRepository.DeleteAsync(slotId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete available slots in a date/time window for a service
        /// </summary>
        [HttpDelete("service/{serviceId}/slots/bulk-available")]
        [EndpointSummary("Delete Available Slots In Window")]
        [EndpointDescription("Delete all AVAILABLE (unbooked) slots for a service within a date/time window. " +
            "Optional filters: dayOfWeek (0=Mon–6=Sun), startTime and endTime ('HH:mm') to target a sub-window. " +
            "BOOKED slots are never touched. Returns the count of deleted slots. " +
            "Authorization: Only the business/service owner can delete slots.")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<object>> DeleteAvailableSlotsInWindow(
            Guid serviceId,
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate,
            [FromQuery] int? dayOfWeek = null,
            [FromQuery] string? startTime = null,
            [FromQuery] string? endTime = null)
        {
            try
            {
                var (_, error) = await AuthorizeServiceOwnerAsync(serviceId);
                if (error != null)
                    return error;

                if (fromDate >= toDate)
                    return BadRequest("fromDate must be before toDate.");

                var deleted = await _serviceScheduleRepository.DeleteAvailableSlotsInWindowAsync(
                    serviceId, fromDate, toDate, dayOfWeek, startTime, endTime);

                return Ok(new { deletedCount = deleted });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Clear all slots for a service
        /// </summary>
        [HttpDelete("service/{serviceId}/clear-slots")]
        [EndpointSummary("Clear All Service Slots")]
        [EndpointDescription("Delete ALL slots for a service (available, booked, and blocked). " +
            "Warning: This will clear all appointment slots including booked ones - use with caution. " +
            "Returns count of deleted slots. " +
            "Authorization: Only business owners can clear slots for their services.")]
        public async Task<ActionResult<object>> ClearAllSlotsForService(Guid serviceId)
        {
            try
            {
                var (_, error) = await AuthorizeServiceOwnerAsync(serviceId);
                if (error != null)
                    return error;

                var slots = await _serviceScheduleRepository.GetByServiceIdAsync(serviceId);
                int deletedCount = 0;

                foreach (var slot in slots)
                {
                    await _serviceScheduleRepository.DeleteAsync(slot.Id);
                    deletedCount++;
                }

                return Ok(new { message = $"Cleared {deletedCount} slots for service", serviceId, deletedCount });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Block a time slot
        /// </summary>
        [HttpPut("slot/{slotId}/block")]
        [EndpointSummary("Block Slot")]
        [EndpointDescription("Mark a slot as blocked (unavailable for booking). " +
            "Returns the updated slot. Useful for maintenance windows or administrative blocks. " +
            "Blocked slots cannot be booked but can be unblocked. " +
            "Authorization: Only business owners can block slots for their services.")]
        public async Task<ActionResult<ServiceScheduleDTO>> BlockSlot(Guid slotId)
        {
            try
            {
                var slot = await _serviceScheduleRepository.GetByIdAsync(slotId);
                if (slot == null)
                    return NotFound($"Slot not found: {slotId}");

                var (_, error) = await AuthorizeServiceOwnerAsync(slot.ServiceId);
                if (error != null)
                    return error;

                slot.Status = ScheduleStatus.BLOCKED;
                slot.UpdatedAt = DateTime.UtcNow;
                var updated = await _serviceScheduleRepository.UpdateAsync(slot);

                return Ok(new ServiceScheduleDTO
                {
                    Id = updated.Id,
                    ServiceId = updated.ServiceId,
                    StartDateTime = updated.StartDateTime,
                    EndDateTime = updated.EndDateTime,
                    Status = updated.Status,
                    CreatedAt = updated.CreatedAt,
                    UpdatedAt = updated.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Unblock a time slot
        /// </summary>
        [HttpPut("slot/{slotId}/unblock")]
        [EndpointSummary("Unblock Slot")]
        [EndpointDescription("Mark a blocked slot as available again. " +
            "Returns the updated slot. Can only unblock slots with BLOCKED status. " +
            "Authorization: Only business owners can unblock slots for their services.")]
        public async Task<ActionResult<ServiceScheduleDTO>> UnblockSlot(Guid slotId)
        {
            try
            {
                var slot = await _serviceScheduleRepository.GetByIdAsync(slotId);
                if (slot == null)
                    return NotFound($"Slot not found: {slotId}");

                var (_, error) = await AuthorizeServiceOwnerAsync(slot.ServiceId);
                if (error != null)
                    return error;

                if (slot.Status != ScheduleStatus.BLOCKED)
                    return BadRequest("Can only unblock slots with BLOCKED status");

                slot.Status = ScheduleStatus.AVAILABLE;
                slot.UpdatedAt = DateTime.UtcNow;
                var updated = await _serviceScheduleRepository.UpdateAsync(slot);

                return Ok(new ServiceScheduleDTO
                {
                    Id = updated.Id,
                    ServiceId = updated.ServiceId,
                    StartDateTime = updated.StartDateTime,
                    EndDateTime = updated.EndDateTime,
                    Status = updated.Status,
                    CreatedAt = updated.CreatedAt,
                    UpdatedAt = updated.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Generate schedule slots for a date range
        /// </summary>
        [HttpPost("service/{serviceId}/generate-slots-range")]
        [EndpointSummary("Generate Schedule Slots for Date Range")]
        [EndpointDescription("Generate available appointment slots for a service across a specified date range. " +
            "Generates slots from StartDate to EndDate (inclusive), respecting all availability rules. " +
            "Rule priority: Date Exceptions (highest) > Recurring Rules > Weekly Working Rules (lowest), then Break Rules subtracted. " +
            "Slots are only created if they don't already exist (idempotent operation). " +
            "Example request: { \"startDate\": \"2026-01-15\", \"endDate\": \"2026-01-31\" }. " +
            "Returns count of newly created slots and summary statistics. " +
            "Authorization: Only business owners or service owners can generate slots.")]
        public async Task<ActionResult<SlotsGenerationResultDTO>> GenerateSlotsForDateRange(
            Guid serviceId,
            [FromBody] GenerateSlotsDateRangeDTO dto)
        {
            try
            {
                var (service, error) = await AuthorizeServiceOwnerAsync(serviceId);
                if (error != null)
                    return error;

                // Validate date range
                if (dto.StartDate >= dto.EndDate)
                    return BadRequest("StartDate must be before EndDate.");

                if (dto.StartDate < DateTime.UtcNow.Date)
                    return BadRequest("StartDate cannot be in the past.");

                var daysInRange = (dto.EndDate - dto.StartDate).Days + 1;
                if (daysInRange > 365)
                    return BadRequest("Date range cannot exceed 365 days.");

                var slotsCreated = await _slotGenerationService.GenerateSlotsForDateRangeAsync(
                    serviceId,
                    dto.StartDate,
                    dto.EndDate);

                var averageSlotsPerDay = daysInRange > 0 ? slotsCreated / daysInRange : 0;

                return Ok(new SlotsGenerationResultDTO
                {
                    TotalSlotsCreated = slotsCreated,
                    AverageSlotsPerDay = averageSlotsPerDay,
                    GenerationStartDate = dto.StartDate,
                    GenerationEndDate = dto.EndDate,
                    DaysInRange = daysInRange,
                    Message = $"Successfully generated {slotsCreated} slots across {daysInRange} days " +
                        $"(avg {averageSlotsPerDay} slots/day) from {dto.StartDate:yyyy-MM-dd} to {dto.EndDate:yyyy-MM-dd}"
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}

