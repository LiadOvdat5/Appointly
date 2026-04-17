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

        /// <summary>
        /// Get all appointments for a client within a date range
        /// </summary>
        Task<List<Appointment>> GetByClientIdAndDateRangeAsync(Guid clientId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Get scheduled appointments whose start time is between now+23h and now+25h
        /// and have not yet had a 24h reminder sent (ReminderSentAt is null).
        /// </summary>
        Task<List<Appointment>> GetDueForReminderAsync();

        /// <summary>
        /// Get scheduled appointments whose start time is between now+45m and now+75m
        /// and have not yet had a 1-hour push reminder sent (ReminderSent1hAt is null).
        /// </summary>
        Task<List<Appointment>> GetDueFor1hReminderAsync();

        /// <summary>
        /// Get completed appointments whose end time was 1–2 hours ago,
        /// have not yet received a review prompt, and have no existing review.
        /// </summary>
        Task<List<Appointment>> GetDueForReviewPromptAsync();

        /// <summary>
        /// Get completed appointments for a client that have no associated review, newest first.
        /// </summary>
        Task<List<Appointment>> GetPendingReviewsForClientAsync(Guid clientId, int limit = 3);
    }
}
