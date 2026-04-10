using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI.DTOs;

namespace WebAPI.Interfaces
{
    public interface IAppointmentService
    {
        /// <summary>
        /// Get appointment by ID with authorization check
        /// </summary>
        Task<AppointmentDTO?> GetAppointmentByIdAsync(Guid appointmentId, Guid userId);

        /// <summary>
        /// Get all appointments for a client with pagination
        /// </summary>
        Task<List<AppointmentDTO>> GetClientAppointmentsAsync(Guid clientId, int page = 1, int pageSize = 20);

        /// <summary>
        /// Get all appointments for a partner with pagination
        /// </summary>
        Task<List<AppointmentDTO>> GetPartnerAppointmentsAsync(Guid partnerId, int page = 1, int pageSize = 20);

        /// <summary>
        /// Get all appointments for a service with pagination
        /// </summary>
        Task<List<AppointmentDTO>> GetServiceAppointmentsAsync(Guid serviceId, Guid userId, int page = 1, int pageSize = 20);

        /// <summary>
        /// Get all appointments for a business with pagination
        /// </summary>
        Task<List<AppointmentDTO>> GetBusinessAppointmentsAsync(Guid businessId, Guid userId, int page = 1, int pageSize = 20);

        /// <summary>
        /// Get appointments within a date range for a business
        /// </summary>
        Task<List<AppointmentDTO>> GetAppointmentsByDateRangeAsync(Guid businessId, Guid userId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Book a new appointment
        /// </summary>
        Task<AppointmentDTO> BookAppointmentAsync(CreateAppointmentDTO dto, Guid clientId);

        /// <summary>
        /// Cancel an appointment
        /// </summary>
        Task<AppointmentDTO> CancelAppointmentAsync(Guid appointmentId, Guid userId, string? reason = null);

        /// <summary>
        /// Update appointment notes or status
        /// </summary>
        Task<AppointmentDTO> UpdateAppointmentAsync(Guid appointmentId, UpdateAppointmentDTO dto, Guid userId);

        /// <summary>
        /// Mark appointment as completed (partner/owner only)
        /// </summary>
        Task<AppointmentDTO> CompleteAppointmentAsync(Guid appointmentId, Guid userId);

        /// <summary>
        /// Get appointment count for a client
        /// </summary>
        Task<int> GetClientAppointmentCountAsync(Guid clientId);

        /// <summary>
        /// Get appointment count for a partner
        /// </summary>
        Task<int> GetPartnerAppointmentCountAsync(Guid partnerId);

        /// <summary>
        /// Get completed appointments for a client that have no associated review, newest first.
        /// </summary>
        Task<List<AppointmentDTO>> GetPendingReviewsAsync(Guid clientId, int limit = 3);
    }
}
