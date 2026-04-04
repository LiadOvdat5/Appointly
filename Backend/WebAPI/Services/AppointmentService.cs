using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Mappers;
using WebAPI.Models;
using WebAPI.Utilities;

namespace WebAPI.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IServiceScheduleRepository _scheduleRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IBusinessRepository _businessRepository;
        private readonly INotificationService _notificationService;
        private readonly AppointmentValidator _validator;
        private readonly AppDbContext _context;

        public AppointmentService(
            IAppointmentRepository appointmentRepository,
            IServiceScheduleRepository scheduleRepository,
            IServiceRepository serviceRepository,
            IBusinessRepository businessRepository,
            INotificationService notificationService,
            AppointmentValidator validator,
            AppDbContext context)
        {
            _appointmentRepository = appointmentRepository;
            _scheduleRepository = scheduleRepository;
            _serviceRepository = serviceRepository;
            _businessRepository = businessRepository;
            _notificationService = notificationService;
            _validator = validator;
            _context = context;
        }

        /// <summary>
        /// Auto-completes any scheduled appointments whose EndDateTime has passed.
        /// Called lazily on fetch to keep statuses current without a background job.
        /// </summary>
        private async Task AutoCompleteExpiredAsync(List<Appointment> appointments)
        {
            var now = DateTime.UtcNow;
            var expired = appointments
                .Where(a => a.Status == AppointmentStatus.scheduled && a.EndDateTime < now)
                .ToList();

            if (expired.Count == 0) return;

            foreach (var appt in expired)
            {
                appt.Status = AppointmentStatus.completed;
                appt.UpdatedAt = now;
            }

            await _context.SaveChangesAsync();
        }

        private async Task<bool> IsOwnerOrPartnerAsync(Guid businessId, Guid userId)
        {
            bool isOwner = await _validator.ValidateBusinessOwnerAccessAsync(businessId, userId);
            if (isOwner) return true;

            return await _context.BusinessPartners
                .AnyAsync(p => p.BusinessId == businessId && p.UserId == userId && p.Status == InvitationStatus.Accepted);
        }

        /// <summary>
        /// Get appointment by ID with authorization check
        /// </summary>
        public async Task<AppointmentDTO?> GetAppointmentByIdAsync(Guid appointmentId, Guid userId)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);

            if (appointment == null)
            {
                throw new AppointmentNotFoundException(appointmentId);
            }

            // Check if user is client, partner, or business owner
            bool isClient = appointment.ClientId == userId;
            bool isPartner = appointment.PartnerId == userId;
            bool isOwner = await _validator.ValidateBusinessOwnerAccessAsync(appointment.BusinessId, userId);

            if (!isClient && !isPartner && !isOwner)
            {
                throw new UnauthorizedAppointmentAccessException();
            }

            return AppointmentMapper.ToDTO(appointment);
        }

        /// <summary>
        /// Get all appointments for a client with pagination
        /// </summary>
        public async Task<List<AppointmentDTO>> GetClientAppointmentsAsync(Guid clientId, int page = 1, int pageSize = 20)
        {
            var appointments = await _appointmentRepository.GetByClientIdAsync(clientId, page, pageSize);
            await AutoCompleteExpiredAsync(appointments);
            return appointments.Select(AppointmentMapper.ToDTO).ToList();
        }

        /// <summary>
        /// Get all appointments for a partner with pagination
        /// </summary>
        public async Task<List<AppointmentDTO>> GetPartnerAppointmentsAsync(Guid partnerId, int page = 1, int pageSize = 20)
        {
            var appointments = await _appointmentRepository.GetByPartnerIdAsync(partnerId, page, pageSize);
            await AutoCompleteExpiredAsync(appointments);
            return appointments.Select(AppointmentMapper.ToDTO).ToList();
        }

        /// <summary>
        /// Get all appointments for a service with pagination
        /// </summary>
        public async Task<List<AppointmentDTO>> GetServiceAppointmentsAsync(Guid serviceId, Guid userId, int page = 1, int pageSize = 20)
        {
            var service = await _serviceRepository.GetByIdAsync(serviceId);
            if (service == null)
            {
                throw new InvalidAppointmentOperationException($"Service with ID '{serviceId}' not found.");
            }

            // Verify user is service owner or business owner
            bool isServiceOwner = service.UserId == userId;
            bool isBusinessOwner = await _validator.ValidateBusinessOwnerAccessAsync(service.BusinessId, userId);

            if (!isServiceOwner && !isBusinessOwner)
            {
                throw new UnauthorizedAppointmentAccessException("You do not have permission to view appointments for this service.");
            }

            var appointments = await _appointmentRepository.GetByServiceIdAsync(serviceId, page, pageSize);
            return appointments.Select(AppointmentMapper.ToDTO).ToList();
        }

        /// <summary>
        /// Get all appointments for a business with pagination
        /// </summary>
        public async Task<List<AppointmentDTO>> GetBusinessAppointmentsAsync(Guid businessId, Guid userId, int page = 1, int pageSize = 20)
        {
            if (!await IsOwnerOrPartnerAsync(businessId, userId))
            {
                throw new UnauthorizedAppointmentAccessException("You do not have permission to view appointments for this business.");
            }

            var appointments = await _appointmentRepository.GetByBusinessIdAsync(businessId, page, pageSize);
            await AutoCompleteExpiredAsync(appointments);
            return appointments.Select(AppointmentMapper.ToDTO).ToList();
        }

        /// <summary>
        /// Get appointments within a date range for a business
        /// </summary>
        public async Task<List<AppointmentDTO>> GetAppointmentsByDateRangeAsync(Guid businessId, Guid userId, DateTime startDate, DateTime endDate)
        {
            if (!await IsOwnerOrPartnerAsync(businessId, userId))
            {
                throw new UnauthorizedAppointmentAccessException("You do not have permission to view appointments for this business.");
            }

            var appointments = await _appointmentRepository.GetByDateRangeAsync(businessId, startDate, endDate);
            await AutoCompleteExpiredAsync(appointments);
            return appointments.Select(AppointmentMapper.ToDTO).ToList();
        }

        /// <summary>
        /// Book a new appointment
        /// </summary>
        public async Task<AppointmentDTO> BookAppointmentAsync(CreateAppointmentDTO dto, Guid clientId)
        {
            // Validate slot availability
            await _validator.ValidateSlotAvailabilityAsync(dto.ServiceScheduleId);

            // Validate service and schedule match
            var schedule = await _validator.ValidateServiceScheduleMatchAsync(dto.ServiceId, dto.ServiceScheduleId);

            // Get service to extract business and partner info
            var service = await _serviceRepository.GetByIdAsync(dto.ServiceId);
            if (service == null)
            {
                throw new InvalidAppointmentOperationException($"Service with ID '{dto.ServiceId}' not found.");
            }

            // Validate appointment is not in the past
            _validator.ValidateNotInPast(schedule.StartDateTime);

            // Validate advance booking limits
            await _validator.ValidateAdvanceBookingAsync(service.BusinessId, schedule.StartDateTime);

            // Check if slot is already booked
            bool isBooked = await _appointmentRepository.IsSlotBookedAsync(dto.ServiceScheduleId);
            if (isBooked)
            {
                throw new SlotUnavailableException(dto.ServiceScheduleId);
            }

            // Create appointment
            var appointment = AppointmentMapper.ToEntity(
                dto,
                clientId,
                service.BusinessId,
                service.UserId, // Partner is the service owner
                schedule.StartDateTime,
                schedule.EndDateTime
            );

            var createdAppointment = await _appointmentRepository.CreateAsync(appointment);

            // Update schedule status to BOOKED
            schedule.Status = ScheduleStatus.BOOKED;
            schedule.AppointmentId = createdAppointment.Id;
            await _scheduleRepository.UpdateAsync(schedule);

            // ── Notifications ────────────────────────────────────────────────
            var clientName   = createdAppointment.Client?.Name   ?? string.Empty;
            var serviceName  = createdAppointment.Service?.Name  ?? string.Empty;
            var businessName = createdAppointment.Business?.Name ?? string.Empty;
            var businessSlug = createdAppointment.Business?.Slug ?? string.Empty;
            var ownerId      = createdAppointment.Business?.OwnerId;
            var notifyBooking = createdAppointment.Business?.NotifyOnNewBooking ?? true;
            var dateLabel    = createdAppointment.StartDateTime.ToLocalTime().ToString("MMM d, h:mm tt");

            // Notify business owner (if opted in)
            if (ownerId.HasValue && notifyBooking)
            {
                await _notificationService.CreateNotificationAsync(
                    userId: ownerId.Value,
                    titleKey: "notifications.appointmentBooked.ownerTitle",
                    bodyKey: "notifications.appointmentBooked.ownerBody",
                    type: Models.NotificationType.AppointmentBooked,
                    relatedEntityId: createdAppointment.Id,
                    targetPath: $"/dashboard/{businessSlug}",
                    bodyParams: new Dictionary<string, string>
                    {
                        ["clientName"]   = clientName,
                        ["serviceName"]  = serviceName,
                        ["date"]         = dateLabel
                    });
            }

            // Notify customer
            await _notificationService.CreateNotificationAsync(
                userId: clientId,
                titleKey: "notifications.appointmentBooked.customerTitle",
                bodyKey: "notifications.appointmentBooked.customerBody",
                type: Models.NotificationType.AppointmentBooked,
                relatedEntityId: createdAppointment.Id,
                targetPath: "/customer-dashboard",
                bodyParams: new Dictionary<string, string>
                {
                    ["serviceName"]  = serviceName,
                    ["businessName"] = businessName,
                    ["date"]         = dateLabel
                });

            return AppointmentMapper.ToDTO(createdAppointment);
        }

        /// <summary>
        /// Cancel an appointment
        /// </summary>
        public async Task<AppointmentDTO> CancelAppointmentAsync(Guid appointmentId, Guid userId, string? reason = null)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);

            if (appointment == null)
            {
                throw new AppointmentNotFoundException(appointmentId);
            }

            // Validate user has access: client (their own appointment) or any business member
            bool isClient = appointment.ClientId == userId;
            bool isBusinessMember = await IsOwnerOrPartnerAsync(appointment.BusinessId, userId);

            if (!isClient && !isBusinessMember)
            {
                throw new UnauthorizedAppointmentAccessException();
            }

            // Customers cannot cancel a completed appointment; business members can (e.g. no-show)
            if (appointment.Status == AppointmentStatus.canceled)
            {
                throw new AppointmentAlreadyCanceledException(appointmentId);
            }

            // Business members can void completed appointments even if they're also the client
            if (appointment.Status == AppointmentStatus.completed && isClient && !isBusinessMember)
            {
                throw new InvalidAppointmentOperationException("Customers cannot cancel a completed appointment.");
            }

            // Update appointment status
            appointment.Status = AppointmentStatus.canceled;
            if (!string.IsNullOrWhiteSpace(reason))
            {
                appointment.Notes = string.IsNullOrWhiteSpace(appointment.Notes)
                    ? $"Cancellation reason: {reason}"
                    : $"{appointment.Notes}\nCancellation reason: {reason}";
            }

            var updatedAppointment = await _appointmentRepository.UpdateAsync(appointment);

            // Update schedule status back to AVAILABLE
            var schedule = await _scheduleRepository.GetByIdAsync(appointment.ServiceScheduleId);
            if (schedule != null)
            {
                schedule.Status = ScheduleStatus.AVAILABLE;
                schedule.AppointmentId = null;
                await _scheduleRepository.UpdateAsync(schedule);
            }

            // ── Cancellation notifications ────────────────────────────────────
            var appt              = updatedAppointment;
            var cName             = appt.Client?.Name   ?? string.Empty;
            var sName             = appt.Service?.Name  ?? string.Empty;
            var bName             = appt.Business?.Name ?? string.Empty;
            var bSlug             = appt.Business?.Slug ?? string.Empty;
            var ownerIdCancel     = appt.Business?.OwnerId;
            var notifyCancel      = appt.Business?.NotifyOnCancellation ?? true;
            var dateCancel        = appt.StartDateTime.ToLocalTime().ToString("MMM d, h:mm tt");

            if (isBusinessMember && !isClient)
            {
                // Business cancelled — notify the customer
                await _notificationService.CreateNotificationAsync(
                    userId: appt.ClientId,
                    titleKey: "notifications.appointmentCancelled.customerTitle",
                    bodyKey: "notifications.appointmentCancelled.customerBody",
                    type: Models.NotificationType.AppointmentCancelled,
                    relatedEntityId: appt.Id,
                    targetPath: "/customer-dashboard",
                    bodyParams: new Dictionary<string, string>
                    {
                        ["serviceName"]  = sName,
                        ["businessName"] = bName,
                        ["date"]         = dateCancel
                    });
            }
            else if (isClient && !isBusinessMember && ownerIdCancel.HasValue && notifyCancel)
            {
                // Customer cancelled — notify the owner (if opted in)
                await _notificationService.CreateNotificationAsync(
                    userId: ownerIdCancel.Value,
                    titleKey: "notifications.appointmentCancelled.ownerTitle",
                    bodyKey: "notifications.appointmentCancelled.ownerBody",
                    type: Models.NotificationType.AppointmentCancelled,
                    relatedEntityId: appt.Id,
                    targetPath: $"/dashboard/{bSlug}",
                    bodyParams: new Dictionary<string, string>
                    {
                        ["clientName"]  = cName,
                        ["serviceName"] = sName,
                        ["date"]        = dateCancel
                    });
            }

            return AppointmentMapper.ToDTO(updatedAppointment);
        }

        /// <summary>
        /// Update appointment notes or status
        /// </summary>
        public async Task<AppointmentDTO> UpdateAppointmentAsync(Guid appointmentId, UpdateAppointmentDTO dto, Guid userId)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);

            if (appointment == null)
            {
                throw new AppointmentNotFoundException(appointmentId);
            }

            // Validate user access
            _validator.ValidateUserAccess(appointment, userId);

            // Apply updates
            AppointmentMapper.UpdateFromDTO(appointment, dto);

            var updatedAppointment = await _appointmentRepository.UpdateAsync(appointment);
            return AppointmentMapper.ToDTO(updatedAppointment);
        }

        /// <summary>
        /// Mark appointment as completed (partner/owner only)
        /// </summary>
        public async Task<AppointmentDTO> CompleteAppointmentAsync(Guid appointmentId, Guid userId)
        {
            var appointment = await _appointmentRepository.GetByIdAsync(appointmentId);

            if (appointment == null)
            {
                throw new AppointmentNotFoundException(appointmentId);
            }

            // Only partner or business owner can complete
            bool isPartner = appointment.PartnerId == userId;
            bool isOwner = await _validator.ValidateBusinessOwnerAccessAsync(appointment.BusinessId, userId);

            if (!isPartner && !isOwner)
            {
                throw new UnauthorizedAppointmentAccessException("Only the service provider or business owner can mark appointments as completed.");
            }

            if (appointment.Status == AppointmentStatus.completed)
            {
                throw new AppointmentAlreadyCompletedException(appointmentId);
            }

            if (appointment.Status == AppointmentStatus.canceled)
            {
                throw new InvalidAppointmentOperationException("Cannot complete a canceled appointment.");
            }

            appointment.Status = AppointmentStatus.completed;
            var updatedAppointment = await _appointmentRepository.UpdateAsync(appointment);

            return AppointmentMapper.ToDTO(updatedAppointment);
        }

        /// <summary>
        /// Get appointment count for a client
        /// </summary>
        public async Task<int> GetClientAppointmentCountAsync(Guid clientId)
        {
            return await _appointmentRepository.GetClientAppointmentCountAsync(clientId);
        }

        /// <summary>
        /// Get appointment count for a partner
        /// </summary>
        public async Task<int> GetPartnerAppointmentCountAsync(Guid partnerId)
        {
            return await _appointmentRepository.GetPartnerAppointmentCountAsync(partnerId);
        }
    }
}
