using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface IAppointmentRepository
    {
        /// <summary>
        /// Get an appointment by ID with all related entities
        /// </summary>
        Task<Appointment?> GetByIdAsync(Guid id);

        /// <summary>
        /// Get appointments for a specific client with pagination
        /// </summary>
        Task<List<Appointment>> GetByClientIdAsync(Guid clientId, int page = 1, int pageSize = 20);

        /// <summary>
        /// Get appointments for a specific partner with pagination
        /// </summary>
        Task<List<Appointment>> GetByPartnerIdAsync(Guid partnerId, int page = 1, int pageSize = 20);

        /// <summary>
        /// Get appointments for a specific service with pagination
        /// </summary>
        Task<List<Appointment>> GetByServiceIdAsync(Guid serviceId, int page = 1, int pageSize = 20);

        /// <summary>
        /// Get appointments for a specific business with pagination
        /// </summary>
        Task<List<Appointment>> GetByBusinessIdAsync(Guid businessId, int page = 1, int pageSize = 20);

        /// <summary>
        /// Get appointments within a date range for a business
        /// </summary>
        Task<List<Appointment>> GetByDateRangeAsync(Guid businessId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Get appointment by service schedule ID
        /// </summary>
        Task<Appointment?> GetByServiceScheduleIdAsync(Guid scheduleId);

        /// <summary>
        /// Check if a slot is already booked
        /// </summary>
        Task<bool> IsSlotBookedAsync(Guid scheduleId);

        /// <summary>
        /// Create a new appointment
        /// </summary>
        Task<Appointment> CreateAsync(Appointment appointment);

        /// <summary>
        /// Update an existing appointment
        /// </summary>
        Task<Appointment> UpdateAsync(Appointment appointment);

        /// <summary>
        /// Delete an appointment by ID
        /// </summary>
        Task DeleteAsync(Guid id);

        /// <summary>
        /// Get count of upcoming appointments for a business
        /// </summary>
        Task<int> GetUpcomingAppointmentCountAsync(Guid businessId);

        /// <summary>
        /// Get total count of appointments for a client
        /// </summary>
        Task<int> GetClientAppointmentCountAsync(Guid clientId);

        /// <summary>
        /// Get total count of appointments for a partner
        /// </summary>
        Task<int> GetPartnerAppointmentCountAsync(Guid partnerId);

        /// <summary>
        /// Get total count of appointments for a service
        /// </summary>
        Task<int> GetServiceAppointmentCountAsync(Guid serviceId);
    }
}
