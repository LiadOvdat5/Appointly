using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Repositories
{
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly AppDbContext _context;

        public AppointmentRepository(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get an appointment by ID with all related entities
        /// </summary>
        public async Task<Appointment?> GetByIdAsync(Guid id)
        {
            return await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Client)
                .Include(a => a.Partner)
                .Include(a => a.Business)
                .Include(a => a.ServiceSchedule)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        /// <summary>
        /// Get appointments for a specific client with pagination
        /// </summary>
        public async Task<List<Appointment>> GetByClientIdAsync(Guid clientId, int page = 1, int pageSize = 20)
        {
            return await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Client)
                .Include(a => a.Partner)
                .Include(a => a.Business)
                .Include(a => a.ServiceSchedule)
                .Where(a => a.ClientId == clientId)
                .OrderByDescending(a => a.StartDateTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        /// <summary>
        /// Get appointments for a specific partner with pagination
        /// </summary>
        public async Task<List<Appointment>> GetByPartnerIdAsync(Guid partnerId, int page = 1, int pageSize = 20)
        {
            return await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Client)
                .Include(a => a.Partner)
                .Include(a => a.Business)
                .Include(a => a.ServiceSchedule)
                .Where(a => a.PartnerId == partnerId)
                .OrderByDescending(a => a.StartDateTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        /// <summary>
        /// Get appointments for a specific service with pagination
        /// </summary>
        public async Task<List<Appointment>> GetByServiceIdAsync(Guid serviceId, int page = 1, int pageSize = 20)
        {
            return await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Client)
                .Include(a => a.Partner)
                .Include(a => a.Business)
                .Include(a => a.ServiceSchedule)
                .Where(a => a.ServiceId == serviceId)
                .OrderByDescending(a => a.StartDateTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        /// <summary>
        /// Get appointments for a specific business with pagination
        /// </summary>
        public async Task<List<Appointment>> GetByBusinessIdAsync(Guid businessId, int page = 1, int pageSize = 20)
        {
            return await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Client)
                .Include(a => a.Partner)
                .Include(a => a.Business)
                .Include(a => a.ServiceSchedule)
                .Where(a => a.BusinessId == businessId)
                .OrderByDescending(a => a.StartDateTime)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        /// <summary>
        /// Get appointments within a date range for a business
        /// </summary>
        public async Task<List<Appointment>> GetByDateRangeAsync(Guid businessId, DateTime startDate, DateTime endDate)
        {
            return await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Client)
                .Include(a => a.Partner)
                .Include(a => a.Business)
                .Include(a => a.ServiceSchedule)
                .Where(a => a.BusinessId == businessId
                    && a.StartDateTime >= startDate
                    && a.StartDateTime <= endDate)
                .OrderBy(a => a.StartDateTime)
                .ToListAsync();
        }

        /// <summary>
        /// Get appointment by service schedule ID
        /// </summary>
        public async Task<Appointment?> GetByServiceScheduleIdAsync(Guid scheduleId)
        {
            return await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Client)
                .Include(a => a.Partner)
                .Include(a => a.Business)
                .Include(a => a.ServiceSchedule)
                .FirstOrDefaultAsync(a => a.ServiceScheduleId == scheduleId);
        }

        /// <summary>
        /// Check if a slot is already booked (only considers scheduled appointments)
        /// </summary>
        public async Task<bool> IsSlotBookedAsync(Guid scheduleId)
        {
            return await _context.Appointments
                .AnyAsync(a => a.ServiceScheduleId == scheduleId && a.Status == AppointmentStatus.scheduled);
        }

        /// <summary>
        /// Create a new appointment
        /// </summary>
        public async Task<Appointment> CreateAsync(Appointment appointment)
        {
            appointment.CreatedAt = DateTime.UtcNow;
            appointment.UpdatedAt = DateTime.UtcNow;

            await _context.Appointments.AddAsync(appointment);
            await _context.SaveChangesAsync();

            // Reload with related entities
            return await GetByIdAsync(appointment.Id) ?? appointment;
        }

        /// <summary>
        /// Update an existing appointment
        /// </summary>
        public async Task<Appointment> UpdateAsync(Appointment appointment)
        {
            appointment.UpdatedAt = DateTime.UtcNow;

            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();

            // Reload with related entities
            return await GetByIdAsync(appointment.Id) ?? appointment;
        }

        /// <summary>
        /// Delete an appointment by ID
        /// </summary>
        public async Task DeleteAsync(Guid id)
        {
            var appointment = await _context.Appointments.FindAsync(id);
            if (appointment != null)
            {
                _context.Appointments.Remove(appointment);
                await _context.SaveChangesAsync();
            }
        }

        /// <summary>
        /// Get count of upcoming appointments for a business
        /// </summary>
        public async Task<int> GetUpcomingAppointmentCountAsync(Guid businessId)
        {
            var now = DateTime.UtcNow;
            return await _context.Appointments
                .Where(a => a.BusinessId == businessId
                    && a.StartDateTime >= now
                    && a.Status == AppointmentStatus.scheduled)
                .CountAsync();
        }

        /// <summary>
        /// Get total count of appointments for a client
        /// </summary>
        public async Task<int> GetClientAppointmentCountAsync(Guid clientId)
        {
            return await _context.Appointments
                .Where(a => a.ClientId == clientId)
                .CountAsync();
        }

        /// <summary>
        /// Get total count of appointments for a partner
        /// </summary>
        public async Task<int> GetPartnerAppointmentCountAsync(Guid partnerId)
        {
            return await _context.Appointments
                .Where(a => a.PartnerId == partnerId)
                .CountAsync();
        }

        /// <summary>
        /// Get total count of appointments for a service
        /// </summary>
        public async Task<int> GetServiceAppointmentCountAsync(Guid serviceId)
        {
            return await _context.Appointments
                .Where(a => a.ServiceId == serviceId)
                .CountAsync();
        }

        /// <summary>
        /// Get all appointments for a client within a date range
        /// </summary>
        public async Task<List<Appointment>> GetByClientIdAndDateRangeAsync(Guid clientId, DateTime startDate, DateTime endDate)
        {
            return await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Business)
                .Where(a => a.ClientId == clientId
                    && a.StartDateTime >= startDate
                    && a.StartDateTime <= endDate)
                .OrderBy(a => a.StartDateTime)
                .ToListAsync();
        }

        /// <summary>
        /// Get scheduled appointments whose start time falls in the 23–25 hour window
        /// from now and have not yet received a reminder notification.
        /// </summary>
        public async Task<List<Appointment>> GetDueForReminderAsync()
        {
            var now = DateTime.UtcNow;
            var windowStart = now.AddHours(23);
            var windowEnd   = now.AddHours(25);

            return await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Business)
                .Where(a => a.Status == AppointmentStatus.scheduled
                    && a.ReminderSentAt == null
                    && a.StartDateTime >= windowStart
                    && a.StartDateTime <= windowEnd)
                .ToListAsync();
        }

        /// <summary>
        /// Get completed appointments for a client that have no associated review, limit n.
        /// </summary>
        public async Task<List<Appointment>> GetPendingReviewsForClientAsync(Guid clientId, int limit = 3)
        {
            return await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Business)
                .Where(a => a.ClientId == clientId
                    && a.Status == AppointmentStatus.completed
                    && !_context.Reviews.Any(r => r.AppointmentId == a.Id))
                .OrderByDescending(a => a.StartDateTime)
                .Take(limit)
                .ToListAsync();
        }

        /// <summary>
        /// Get completed appointments whose end time was 1–2 hours ago,
        /// have not yet received a review prompt, and have no existing review.
        /// </summary>
        public async Task<List<Appointment>> GetDueForReviewPromptAsync()
        {
            var now         = DateTime.UtcNow;
            var windowStart = now.AddHours(-2);
            var windowEnd   = now.AddHours(-1);

            return await _context.Appointments
                .Include(a => a.Service)
                .Include(a => a.Business)
                .Where(a => a.Status == AppointmentStatus.completed
                    && a.ReviewPromptSentAt == null
                    && a.EndDateTime >= windowStart
                    && a.EndDateTime <= windowEnd
                    && !_context.Reviews.Any(r => r.AppointmentId == a.Id))
                .ToListAsync();
        }
    }
}
