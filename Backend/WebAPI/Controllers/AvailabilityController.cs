using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;
using WebAPI.Mappers;
using WebAPI.Interfaces;
using WebAPI.Models;
using WebAPI.Utilities;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AvailabilityController : ControllerBase
    {
        private readonly IWeeklyWorkingRuleRepository _weeklyWorkingRuleRepository;
        private readonly IBreakRuleRepository _breakRuleRepository;
        private readonly IRecurringRuleRepository _recurringRuleRepository;
        private readonly IDateExceptionRepository _dateExceptionRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IServiceScheduleRepository _serviceScheduleRepository;

        public AvailabilityController(
            IWeeklyWorkingRuleRepository weeklyWorkingRuleRepository,
            IBreakRuleRepository breakRuleRepository,
            IRecurringRuleRepository recurringRuleRepository,
            IDateExceptionRepository dateExceptionRepository,
            IServiceRepository serviceRepository,
            IServiceScheduleRepository serviceScheduleRepository)
        {
            _weeklyWorkingRuleRepository = weeklyWorkingRuleRepository;
            _breakRuleRepository = breakRuleRepository;
            _recurringRuleRepository = recurringRuleRepository;
            _dateExceptionRepository = dateExceptionRepository;
            _serviceRepository = serviceRepository;
            _serviceScheduleRepository = serviceScheduleRepository;
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

        // ==================== Weekly Working Rules ====================

        [HttpGet("service/{serviceId}/weekly-rules")]
        [EndpointSummary("Get Service Weekly Working Rules")]
        [EndpointDescription("Retrieve all weekly working rules for a service. Returns rules defining which days of the week the service is available. " +
            "Each rule specifies: day of week (0=Monday to 6=Sunday), start time, end time, and whether it's a working day. " +
            "Useful for displaying recurring availability patterns to customers. " +
            "Authorization: Authorized users can view any service's rules. " +
            "Example ID: 550e8400-e29b-41d4-a716-446655440000")]
        public async Task<ActionResult<List<WeeklyWorkingRuleDTO>>> GetWeeklyRules(Guid serviceId)
        {
            try
            {
                var service = await _serviceRepository.GetByIdAsync(serviceId);
                if (service == null)
                    return NotFound($"Service not found: {serviceId}");

                var rules = await _weeklyWorkingRuleRepository.GetByServiceIdAsync(serviceId);
                return Ok(rules.Select(WeeklyWorkingRuleMapper.ToDTO).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("weekly-rule")]
        [EndpointSummary("Create Weekly Working Rule")]
        [EndpointDescription("Create a new weekly working rule for a service. Defines when the service is available on a specific day of the week. " +
            "Required fields: ServiceId (Guid), DayOfWeek (0=Monday to 6=Sunday), IsWorkingDay (boolean), StartTime (HH:mm:ss), EndTime (HH:mm:ss). " +
            "Example: { \"serviceId\": \"550e8400-e29b-41d4-a716-446655440000\", \"dayOfWeek\": 1, \"isWorkingDay\": true, \"startTime\": \"09:00:00\", \"endTime\": \"17:00:00\" }. " +
            "Authorization: Only business owners can create rules for their services.")]
        public async Task<ActionResult<WeeklyWorkingRuleDTO>> CreateWeeklyRule([FromBody] CreateWeeklyWorkingRuleDTO dto)
        {
            try
            {
                var (_, error) = await AuthorizeServiceOwnerAsync(dto.ServiceId);
                if (error != null)
                    return error;

                var rule = WeeklyWorkingRuleMapper.FromCreateDTO(dto);
                var created = await _weeklyWorkingRuleRepository.CreateAsync(rule);

                return CreatedAtAction(
                    nameof(GetWeeklyRules),
                    new { serviceId = created.ServiceId },
                    WeeklyWorkingRuleMapper.ToDTO(created));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("weekly-rule/{ruleId}")]
        [EndpointSummary("Update Weekly Working Rule")]
        [EndpointDescription("Update an existing weekly working rule. Supports partial updates - only include fields to change. " +
            "Optional fields: DayOfWeek (0-6), IsWorkingDay (boolean), StartTime (HH:mm:ss), EndTime (HH:mm:ss). " +
            "Example: { \"dayOfWeek\": 2, \"startTime\": \"10:00:00\", \"endTime\": \"18:00:00\" }. " +
            "Changes will affect future slot generation. " +
            "Authorization: Only business owners can update rules for their services.")]
        public async Task<ActionResult<WeeklyWorkingRuleDTO>> UpdateWeeklyRule(
            Guid ruleId,
            [FromBody] UpdateWeeklyWorkingRuleDTO dto)
        {
            try
            {
                var existing = await _weeklyWorkingRuleRepository.GetByIdAsync(ruleId);
                if (existing == null)
                    return NotFound($"Weekly working rule not found: {ruleId}");

                var (_, error) = await AuthorizeServiceOwnerAsync(existing.ServiceId);
                if (error != null)
                    return error;

                WeeklyWorkingRuleMapper.UpdateFromDTO(existing, dto);
                var updated = await _weeklyWorkingRuleRepository.UpdateAsync(existing);

                return Ok(WeeklyWorkingRuleMapper.ToDTO(updated));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("weekly-rule/{ruleId}")]
        [EndpointSummary("Delete Weekly Working Rule")]
        [EndpointDescription("Delete a weekly working rule. Returns 204 No Content on success. " +
            "Deleting a rule changes the service's availability pattern. " +
            "To regenerate slots after deletion, use /schedule/service/{serviceId}/regenerate-slots. " +
            "Authorization: Only business owners can delete rules for their services.")]
        public async Task<IActionResult> DeleteWeeklyRule(Guid ruleId)
        {
            try
            {
                var existing = await _weeklyWorkingRuleRepository.GetByIdAsync(ruleId);
                if (existing == null)
                    return NotFound($"Weekly working rule not found: {ruleId}");

                var (_, error) = await AuthorizeServiceOwnerAsync(existing.ServiceId);
                if (error != null)
                    return error;

                var success = await _weeklyWorkingRuleRepository.DeleteAsync(ruleId);
                if (!success)
                    return NotFound($"Weekly working rule not found: {ruleId}");

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // ==================== Break Rules ====================

        [HttpGet("service/{serviceId}/break-rules")]
        [EndpointSummary("Get Service Break Rules")]
        [EndpointDescription("Retrieve all break rules for a service. Break rules define when the service provider is unavailable (lunch, maintenance, etc.).\n " +
            "Each rule specifies: start time, end time, optional day of week, optional date range. " +
            "Breaks are subtracted from working hours when generating slots. " +
            "Authorization: Authorized users can view any service's break rules.")]
        public async Task<ActionResult<List<BreakRuleDTO>>> GetBreakRules(Guid serviceId)
        {
            try
            {
                var service = await _serviceRepository.GetByIdAsync(serviceId);
                if (service == null)
                    return NotFound($"Service not found: {serviceId}");

                var rules = await _breakRuleRepository.GetByServiceIdAsync(serviceId);
                return Ok(rules.Select(BreakRuleMapper.ToDTO).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("break-rule")]
        [EndpointSummary("Create Break Rule")]
        [EndpointDescription("Create a new break rule for a service. Defines periods when the service is unavailable. " +
            "Required fields: ServiceId (Guid), StartTime (HH:mm:ss), EndTime (HH:mm:ss). " +
            "Optional fields: DayOfWeek (0-6, if null applies to all days), StartDate, EndDate (for date-specific breaks like vacations). " +
            "Example: { \"serviceId\": \"550e8400-e29b-41d4-a716-446655440000\", \"startTime\": \"12:00:00\", \"endTime\": \"13:00:00\" }. " +
            "Authorization: Only business owners can create break rules for their services.")]
        public async Task<ActionResult<BreakRuleDTO>> CreateBreakRule([FromBody] CreateBreakRuleDTO dto)
        {
            try
            {
                var (_, error) = await AuthorizeServiceOwnerAsync(dto.ServiceId);
                if (error != null)
                    return error;

                var rule = BreakRuleMapper.FromCreateDTO(dto);
                var created = await _breakRuleRepository.CreateAsync(rule);

                return CreatedAtAction(
                    nameof(GetBreakRules),
                    new { serviceId = created.ServiceId },
                    BreakRuleMapper.ToDTO(created));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("break-rule/{ruleId}")]
        [EndpointSummary("Update Break Rule")]
        [EndpointDescription("Update an existing break rule. Supports partial updates - only include fields to change. " +
            "Optional fields: StartTime, EndTime, DayOfWeek, StartDate, EndDate. " +
            "Example: { \"endDate\": \"2026-02-15\" } (for extending a vacation break). " +
            "Changes will affect future slot generation. " +
            "Authorization: Only business owners can update break rules for their services.")]
        public async Task<ActionResult<BreakRuleDTO>> UpdateBreakRule(
            Guid ruleId,
            [FromBody] UpdateBreakRuleDTO dto)
        {
            try
            {
                var existing = await _breakRuleRepository.GetByIdAsync(ruleId);
                if (existing == null)
                    return NotFound($"Break rule not found: {ruleId}");

                var (_, error) = await AuthorizeServiceOwnerAsync(existing.ServiceId);
                if (error != null)
                    return error;

                BreakRuleMapper.UpdateFromDTO(existing, dto);
                var updated = await _breakRuleRepository.UpdateAsync(existing);

                return Ok(BreakRuleMapper.ToDTO(updated));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("break-rule/{ruleId}")]
        [EndpointSummary("Delete Break Rule")]
        [EndpointDescription("Delete a break rule. Returns 204 No Content on success. " +
            "Deleting a rule removes the break period from the service's unavailability. " +
            "Authorization: Only business owners can delete break rules for their services.")]
        public async Task<IActionResult> DeleteBreakRule(Guid ruleId)
        {
            try
            {
                var existing = await _breakRuleRepository.GetByIdAsync(ruleId);
                if (existing == null)
                    return NotFound($"Break rule not found: {ruleId}");

                var (_, error) = await AuthorizeServiceOwnerAsync(existing.ServiceId);
                if (error != null)
                    return error;

                var success = await _breakRuleRepository.DeleteAsync(ruleId);
                if (!success)
                    return NotFound($"Break rule not found: {ruleId}");

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // ==================== Recurring Rules ====================

        [HttpGet("service/{serviceId}/recurring-rules")]
        [EndpointSummary("Get Service Recurring Rules")]
        [EndpointDescription("Retrieve all recurring rules for a service. Recurring rules define temporary availability patterns that override weekly rules. " +
            "Each rule specifies: date range, days of week, and working hours for that period. Useful for seasonal availability or temporary schedule changes. " +
            "Priority: Recurring rules override weekly working rules. " +
            "Authorization: Authorized users can view any service's recurring rules.")]
        public async Task<ActionResult<List<RecurringRuleDTO>>> GetRecurringRules(Guid serviceId)
        {
            try
            {
                var service = await _serviceRepository.GetByIdAsync(serviceId);
                if (service == null)
                    return NotFound($"Service not found: {serviceId}");

                var rules = await _recurringRuleRepository.GetByServiceIdAsync(serviceId);
                return Ok(rules.Select(RecurringRuleMapper.ToDTO).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("recurring-rule")]
        [EndpointSummary("Create Recurring Rule")]
        [EndpointDescription("Create a new recurring rule for a service. Defines a temporary availability pattern for a specific date range. " +
            "Required fields: ServiceId (Guid), StartDate, EndDate, DaysOfWeek (JSON array of 0-6), StartTime (HH:mm:ss), EndTime (HH:mm:ss). " +
            "Example: { \"serviceId\": \"550e8400-e29b-41d4-a716-446655440000\", \"startDate\": \"2026-03-01\", \"endDate\": \"2026-03-31\", " +
            "\"daysOfWeek\": \"[1,2,3,4,5]\", \"startTime\": \"10:00:00\", \"endTime\": \"18:00:00\" }. " +
            "Authorization: Only business owners can create recurring rules for their services.")]
        public async Task<ActionResult<RecurringRuleDTO>> CreateRecurringRule([FromBody] CreateRecurringRuleDTO dto)
        {
            try
            {
                var (_, error) = await AuthorizeServiceOwnerAsync(dto.ServiceId);
                if (error != null)
                    return error;

                var rule = RecurringRuleMapper.FromCreateDTO(dto);
                var created = await _recurringRuleRepository.CreateAsync(rule);

                return CreatedAtAction(
                    nameof(GetRecurringRules),
                    new { serviceId = created.ServiceId },
                    RecurringRuleMapper.ToDTO(created));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("recurring-rule/{ruleId}")]
        [EndpointSummary("Update Recurring Rule")]
        [EndpointDescription("Update an existing recurring rule. Supports partial updates - only include fields to change. " +
            "Optional fields: StartDate, EndDate, DaysOfWeek, StartTime (HH:mm:ss), EndTime (HH:mm:ss). " +
            "Example: { \"endDate\": \"2026-04-15\", \"startTime\": \"09:00:00\" } (extending rule duration and changing hours). " +
            "Changes affect slot generation for affected dates. " +
            "Authorization: Only business owners can update recurring rules for their services.")]
        public async Task<ActionResult<RecurringRuleDTO>> UpdateRecurringRule(
            Guid ruleId,
            [FromBody] UpdateRecurringRuleDTO dto)
        {
            try
            {
                var existing = await _recurringRuleRepository.GetByIdAsync(ruleId);
                if (existing == null)
                    return NotFound($"Recurring rule not found: {ruleId}");

                var (_, error) = await AuthorizeServiceOwnerAsync(existing.ServiceId);
                if (error != null)
                    return error;

                RecurringRuleMapper.UpdateFromDTO(existing, dto);
                var updated = await _recurringRuleRepository.UpdateAsync(existing);

                return Ok(RecurringRuleMapper.ToDTO(updated));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("recurring-rule/{ruleId}")]
        [EndpointSummary("Delete Recurring Rule")]
        [EndpointDescription("Delete a recurring rule. Returns 204 No Content on success. " +
            "Deleting removes the temporary availability pattern, reverting to weekly rules for that date range. " +
            "Authorization: Only business owners can delete recurring rules for their services.")]
        public async Task<IActionResult> DeleteRecurringRule(Guid ruleId)
        {
            try
            {
                var existing = await _recurringRuleRepository.GetByIdAsync(ruleId);
                if (existing == null)
                    return NotFound($"Recurring rule not found: {ruleId}");

                var (_, error) = await AuthorizeServiceOwnerAsync(existing.ServiceId);
                if (error != null)
                    return error;

                var success = await _recurringRuleRepository.DeleteAsync(ruleId);
                if (!success)
                    return NotFound($"Recurring rule not found: {ruleId}");

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // ==================== Date Exceptions ====================

        [HttpGet("service/{serviceId}/date-exceptions")]
        [EndpointSummary("Get Service Date Exceptions")]
        [EndpointDescription("Retrieve all date exceptions for a service. Date exceptions define specific date overrides for availability. " +
            "Useful for holidays, special closures, or one-off schedule changes. Each exception specifies: date, whether it's a working day, and optional working hours. " +
            "Priority: Date exceptions have the highest priority in availability resolution. " +
            "Authorization: Authorized users can view any service's date exceptions.")]
        public async Task<ActionResult<List<DateExceptionDTO>>> GetDateExceptions(Guid serviceId)
        {
            try
            {
                var service = await _serviceRepository.GetByIdAsync(serviceId);
                if (service == null)
                    return NotFound($"Service not found: {serviceId}");

                var exceptions = await _dateExceptionRepository.GetByServiceIdAsync(serviceId);
                return Ok(exceptions.Select(DateExceptionMapper.ToDTO).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("date-exception")]
        [EndpointSummary("Create Date Exception")]
        [EndpointDescription("Create a new date exception for a service. Overrides normal availability for a specific date. " +
            "Required fields: ServiceId (Guid), Date, IsWorkingDay (boolean). " +
            "Optional fields: StartTime (HH:mm:ss), EndTime (HH:mm:ss) - only if IsWorkingDay=true for custom hours. " +
            "Example: { \"serviceId\": \"550e8400-e29b-41d4-a716-446655440000\", \"date\": \"2026-01-15\", \"isWorkingDay\": false } (holiday closure). " +
            "Authorization: Only business owners can create date exceptions for their services.")]
        public async Task<ActionResult<DateExceptionDTO>> CreateDateException([FromBody] CreateDateExceptionDTO dto)
        {
            try
            {
                var (_, error) = await AuthorizeServiceOwnerAsync(dto.ServiceId);
                if (error != null)
                    return error;

                var exception = DateExceptionMapper.FromCreateDTO(dto);
                var created = await _dateExceptionRepository.CreateAsync(exception);

                // Block any already-generated slots for this date
                if (!created.IsWorkingDay)
                    await _serviceScheduleRepository.BlockAvailableSlotsForDateAsync(created.ServiceId, created.Date);

                return CreatedAtAction(
                    nameof(GetDateExceptions),
                    new { serviceId = created.ServiceId },
                    DateExceptionMapper.ToDTO(created));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("date-exception/{exceptionId}")]
        [EndpointSummary("Update Date Exception")]
        [EndpointDescription("Update an existing date exception. Supports partial updates - only include fields to change. " +
            "Optional fields: Date, IsWorkingDay, StartTime (HH:mm:ss), EndTime (HH:mm:ss). " +
            "Example: { \"isWorkingDay\": true, \"startTime\": \"14:00:00\", \"endTime\": \"18:00:00\" } " +
            "(changing a holiday to a half-day). " +
            "Authorization: Only business owners can update date exceptions for their services.")]
        public async Task<ActionResult<DateExceptionDTO>> UpdateDateException(
            Guid exceptionId,
            [FromBody] UpdateDateExceptionDTO dto)
        {
            try
            {
                var existing = await _dateExceptionRepository.GetByIdAsync(exceptionId);
                if (existing == null)
                    return NotFound($"Date exception not found: {exceptionId}");

                var (_, error) = await AuthorizeServiceOwnerAsync(existing.ServiceId);
                if (error != null)
                    return error;

                DateExceptionMapper.UpdateFromDTO(existing, dto);
                var updated = await _dateExceptionRepository.UpdateAsync(existing);

                return Ok(DateExceptionMapper.ToDTO(updated));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("date-exception/{exceptionId}")]
        [EndpointSummary("Delete Date Exception")]
        [EndpointDescription("Delete a date exception. Returns 204 No Content on success. " +
            "Deleting removes the override, reverting to normal weekly/recurring rules for that date. " +
            "Authorization: Only business owners can delete date exceptions for their services.")]
        public async Task<IActionResult> DeleteDateException(Guid exceptionId)
        {
            try
            {
                var existing = await _dateExceptionRepository.GetByIdAsync(exceptionId);
                if (existing == null)
                    return NotFound($"Date exception not found: {exceptionId}");

                var (_, error) = await AuthorizeServiceOwnerAsync(existing.ServiceId);
                if (error != null)
                    return error;

                // Restore slots blocked by this exception before deleting it
                if (!existing.IsWorkingDay)
                    await _serviceScheduleRepository.UnblockSlotsForDateAsync(existing.ServiceId, existing.Date);

                var success = await _dateExceptionRepository.DeleteAsync(exceptionId);
                if (!success)
                    return NotFound($"Date exception not found: {exceptionId}");

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
