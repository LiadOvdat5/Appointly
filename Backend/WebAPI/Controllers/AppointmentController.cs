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
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        private Guid? GetCurrentUserId()
        {
            return User.GetUserId();
        }

        /// <summary>
        /// Get appointment by ID
        /// </summary>
        /// <param name="id">Appointment ID</param>
        /// <returns>Appointment details</returns>
        [HttpGet("{id}")]
        [EndpointSummary("Get Appointment Details")]
        [EndpointDescription("Retrieve detailed information about a specific appointment including client, partner, service, and business details. " +
            "Authorization: Only the client, partner, or business owner can access appointment details. " +
            "Returns complete appointment information with all related entity data. " +
            "Example ID: 550e8400-e29b-41d4-a716-446655440000")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AppointmentDTO>> GetAppointment(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized("User is not authenticated.");

                var appointment = await _appointmentService.GetAppointmentByIdAsync(id, userId.Value);

                if (appointment == null)
                    return NotFound($"Appointment with ID '{id}' not found.");

                return Ok(appointment);
            }
            catch (AppointmentNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAppointmentAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"An error occurred while retrieving the appointment: {ex.Message}");
            }
        }

        /// <summary>
        /// Get all appointments for the authenticated client
        /// </summary>
        /// <param name="page">Page number (default: 1)</param>
        /// <param name="pageSize">Page size (default: 20)</param>
        /// <returns>List of client appointments</returns>
        [HttpGet("client")]
        [EndpointSummary("Get Client Appointments")]
        [EndpointDescription("Retrieve all appointments for the authenticated user as a client. " +
            "Returns paginated list of appointments booked by the current user. " +
            "Results are ordered by start date (newest first). " +
            "Includes scheduled, canceled, and completed appointments. " +
            "Supports pagination with page and pageSize query parameters.")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<List<AppointmentDTO>>> GetClientAppointments(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized("User is not authenticated.");

                var appointments = await _appointmentService.GetClientAppointmentsAsync(userId.Value, page, pageSize);
                return Ok(appointments);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"An error occurred while retrieving client appointments: {ex.Message}");
            }
        }

        /// <summary>
        /// Get all appointments for the authenticated partner
        /// </summary>
        /// <param name="page">Page number (default: 1)</param>
        /// <param name="pageSize">Page size (default: 20)</param>
        /// <returns>List of partner appointments</returns>
        [HttpGet("partner")]
        [EndpointSummary("Get Partner Appointments")]
        [EndpointDescription("Retrieve all appointments for the authenticated user as a service partner. " +
            "Returns paginated list of appointments where the current user is the service provider. " +
            "Results are ordered by start date (newest first). " +
            "Useful for partners to view their schedule and upcoming appointments. " +
            "Supports pagination with page and pageSize query parameters.")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<List<AppointmentDTO>>> GetPartnerAppointments(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized("User is not authenticated.");

                var appointments = await _appointmentService.GetPartnerAppointmentsAsync(userId.Value, page, pageSize);
                return Ok(appointments);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"An error occurred while retrieving partner appointments: {ex.Message}");
            }
        }

        /// <summary>
        /// Get all appointments for a specific service
        /// </summary>
        /// <param name="serviceId">Service ID</param>
        /// <param name="page">Page number (default: 1)</param>
        /// <param name="pageSize">Page size (default: 20)</param>
        /// <returns>List of service appointments</returns>
        [HttpGet("service/{serviceId}")]
        [EndpointSummary("Get Service Appointments")]
        [EndpointDescription("Retrieve all appointments for a specific service. " +
            "Returns paginated list of appointments for the specified service. " +
            "Authorization: Only the service owner or business owner can access this data. " +
            "Results are ordered by start date (newest first). " +
            "Useful for analyzing service utilization and booking patterns. " +
            "Example Service ID: 550e8400-e29b-41d4-a716-446655440000")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<List<AppointmentDTO>>> GetServiceAppointments(
            Guid serviceId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized("User is not authenticated.");

                var appointments = await _appointmentService.GetServiceAppointmentsAsync(serviceId, userId.Value, page, pageSize);
                return Ok(appointments);
            }
            catch (UnauthorizedAppointmentAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
            }
            catch (InvalidAppointmentOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"An error occurred while retrieving service appointments: {ex.Message}");
            }
        }

        /// <summary>
        /// Get all appointments for a specific business
        /// </summary>
        /// <param name="businessId">Business ID</param>
        /// <param name="page">Page number (default: 1)</param>
        /// <param name="pageSize">Page size (default: 20)</param>
        /// <returns>List of business appointments</returns>
        [HttpGet("business/{businessId}")]
        [EndpointSummary("Get Business Appointments")]
        [EndpointDescription("Retrieve all appointments for a specific business across all services. " +
            "Returns paginated list of all business appointments. " +
            "Authorization: Only the business owner can access this data. " +
            "Results are ordered by start date (newest first). " +
            "Useful for business-wide scheduling and analytics. " +
            "Example Business ID: 550e8400-e29b-41d4-a716-446655440000")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<List<AppointmentDTO>>> GetBusinessAppointments(
            Guid businessId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized("User is not authenticated.");

                var appointments = await _appointmentService.GetBusinessAppointmentsAsync(businessId, userId.Value, page, pageSize);
                return Ok(appointments);
            }
            catch (UnauthorizedAppointmentAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"An error occurred while retrieving business appointments: {ex.Message}");
            }
        }

        /// <summary>
        /// Get appointments within a date range for a business
        /// </summary>
        /// <param name="businessId">Business ID</param>
        /// <param name="startDate">Start date</param>
        /// <param name="endDate">End date</param>
        /// <returns>List of appointments in date range</returns>
        [HttpGet("business/{businessId}/range")]
        [EndpointSummary("Get Appointments By Date Range")]
        [EndpointDescription("Retrieve appointments for a business within a specific date range. " +
            "Returns list of appointments between startDate and endDate. " +
            "Authorization: Only the business owner can access this data. " +
            "Results are ordered by start date chronologically. " +
            "Useful for calendar views and reporting. " +
            "Date format: YYYY-MM-DDTHH:mm:ss " +
            "Example Business ID: 550e8400-e29b-41d4-a716-446655440000")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<List<AppointmentDTO>>> GetAppointmentsByDateRange(
            Guid businessId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized("User is not authenticated.");

                if (startDate > endDate)
                    return BadRequest("Start date must be before end date.");

                var appointments = await _appointmentService.GetAppointmentsByDateRangeAsync(businessId, userId.Value, startDate, endDate);
                return Ok(appointments);
            }
            catch (UnauthorizedAppointmentAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"An error occurred while retrieving appointments by date range: {ex.Message}");
            }
        }

        /// <summary>
        /// Book a new appointment
        /// </summary>
        /// <param name="dto">Appointment booking details</param>
        /// <returns>Created appointment</returns>
        [HttpPost]
        [EndpointSummary("Book New Appointment")]
        [EndpointDescription("Create a new appointment booking for a service time slot. " +
            "Validates slot availability, service schedule match, and business booking rules. " +
            "Automatically updates the slot status to BOOKED upon successful booking. " +
            "Checks advance booking days limit and prevents booking in the past. " +
            "Returns the created appointment with complete details including client, partner, and service information. " +
            "The authenticated user becomes the client for the appointment.")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<AppointmentDTO>> BookAppointment([FromBody] CreateAppointmentDTO dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized("User is not authenticated.");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var appointment = await _appointmentService.BookAppointmentAsync(dto, userId.Value);
                return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, appointment);
            }
            catch (SlotUnavailableException ex)
            {
                return Conflict(ex.Message);
            }
            catch (InvalidAppointmentOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"An error occurred while booking the appointment: {ex.Message}");
            }
        }

        /// <summary>
        /// Cancel an appointment
        /// </summary>
        /// <param name="id">Appointment ID</param>
        /// <param name="dto">Cancellation details</param>
        /// <returns>Updated appointment</returns>
        [HttpPatch("{id}/cancel")]
        [EndpointSummary("Cancel Appointment")]
        [EndpointDescription("Cancel an existing appointment and release the time slot. " +
            "Updates appointment status to canceled and returns the slot to AVAILABLE. " +
            "Authorization: Client, partner, or business owner can cancel. " +
            "Optional cancellation reason can be provided and will be appended to notes. " +
            "Cannot cancel already canceled or completed appointments. " +
            "Example Appointment ID: 550e8400-e29b-41d4-a716-446655440000")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AppointmentDTO>> CancelAppointment(
            Guid id,
            [FromBody] CancelAppointmentDTO? dto = null)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized("User is not authenticated.");

                var appointment = await _appointmentService.CancelAppointmentAsync(id, userId.Value, dto?.CancellationReason);
                return Ok(appointment);
            }
            catch (AppointmentNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAppointmentAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
            }
            catch (AppointmentAlreadyCanceledException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (AppointmentAlreadyCompletedException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"An error occurred while canceling the appointment: {ex.Message}");
            }
        }

        /// <summary>
        /// Update appointment notes or status
        /// </summary>
        /// <param name="id">Appointment ID</param>
        /// <param name="dto">Update details</param>
        /// <returns>Updated appointment</returns>
        [HttpPatch("{id}")]
        [EndpointSummary("Update Appointment")]
        [EndpointDescription("Update appointment notes or status. " +
            "Allows partial updates - only provided fields will be modified. " +
            "Authorization: Client or partner can update appointment details. " +
            "Common use cases: adding notes, updating preferences, or modifying appointment metadata. " +
            "Status can be updated but use dedicated endpoints for cancel/complete operations. " +
            "Example Appointment ID: 550e8400-e29b-41d4-a716-446655440000")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AppointmentDTO>> UpdateAppointment(
            Guid id,
            [FromBody] UpdateAppointmentDTO dto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized("User is not authenticated.");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var appointment = await _appointmentService.UpdateAppointmentAsync(id, dto, userId.Value);
                return Ok(appointment);
            }
            catch (AppointmentNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAppointmentAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"An error occurred while updating the appointment: {ex.Message}");
            }
        }

        /// <summary>
        /// Mark an appointment as completed (partner/owner only)
        /// </summary>
        /// <param name="id">Appointment ID</param>
        /// <returns>Updated appointment</returns>
        [HttpPatch("{id}/complete")]
        [EndpointSummary("Complete Appointment")]
        [EndpointDescription("Mark an appointment as completed after service is rendered. " +
            "Updates appointment status to completed. " +
            "Authorization: Only the service partner or business owner can mark appointments as completed. " +
            "Cannot complete already completed or canceled appointments. " +
            "Use this endpoint after successfully providing the service to the client. " +
            "Example Appointment ID: 550e8400-e29b-41d4-a716-446655440000")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AppointmentDTO>> CompleteAppointment(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized("User is not authenticated.");

                var appointment = await _appointmentService.CompleteAppointmentAsync(id, userId.Value);
                return Ok(appointment);
            }
            catch (AppointmentNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (UnauthorizedAppointmentAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
            }
            catch (AppointmentAlreadyCompletedException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidAppointmentOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"An error occurred while completing the appointment: {ex.Message}");
            }
        }

        /// <summary>
        /// Get appointment count for the authenticated client
        /// </summary>
        /// <returns>Count of client appointments</returns>
        [HttpGet("client/count")]
        [EndpointSummary("Get Client Appointment Count")]
        [EndpointDescription("Retrieve the total number of appointments for the authenticated client. " +
            "Returns count of all appointments (scheduled, canceled, and completed). " +
            "Useful for displaying statistics and user dashboards. " +
            "Counts all historical appointments for the current user.")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<int>> GetClientAppointmentCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized("User is not authenticated.");

                var count = await _appointmentService.GetClientAppointmentCountAsync(userId.Value);
                return Ok(count);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"An error occurred while retrieving appointment count: {ex.Message}");
            }
        }

        /// <summary>
        /// Get appointment count for the authenticated partner
        /// </summary>
        /// <returns>Count of partner appointments</returns>
        [HttpGet("partner/count")]
        [EndpointSummary("Get Partner Appointment Count")]
        [EndpointDescription("Retrieve the total number of appointments for the authenticated partner. " +
            "Returns count of all appointments where the user is the service provider. " +
            "Useful for displaying partner statistics and performance metrics. " +
            "Counts all historical appointments across all services provided by the partner.")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<int>> GetPartnerAppointmentCount()
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue)
                    return Unauthorized("User is not authenticated.");

                var count = await _appointmentService.GetPartnerAppointmentCountAsync(userId.Value);
                return Ok(count);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"An error occurred while retrieving appointment count: {ex.Message}");
            }
        }
    }
}
