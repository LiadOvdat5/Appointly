using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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
        private readonly AppointmentValidator _validator;

        public AppointmentService(
            IAppointmentRepository appointmentRepository,
            IServiceScheduleRepository scheduleRepository,
            IServiceRepository serviceRepository,
            IBusinessRepository businessRepository,
            AppointmentValidator validator)
        {
            _appointmentRepository = appointmentRepository;
            _scheduleRepository = scheduleRepository;
            _serviceRepository = serviceRepository;
            _businessRepository = businessRepository;
            _validator = validator;
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
            return appointments.Select(AppointmentMapper.ToDTO).ToList();
        }

        /// <summary>
        /// Get all appointments for a partner with pagination
        /// </summary>
        public async Task<List<AppointmentDTO>> GetPartnerAppointmentsAsync(Guid partnerId, int page = 1, int pageSize = 20)
        {
            var appointments = await _appointmentRepository.GetByPartnerIdAsync(partnerId, page, pageSize);
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
            bool isOwner = await _validator.ValidateBusinessOwnerAccessAsync(businessId, userId);

            if (!isOwner)
            {
                throw new UnauthorizedAppointmentAccessException("You do not have permission to view appointments for this business.");
            }

            var appointments = await _appointmentRepository.GetByBusinessIdAsync(businessId, page, pageSize);
            return appointments.Select(AppointmentMapper.ToDTO).ToList();
        }

        /// <summary>
        /// Get appointments within a date range for a business
        /// </summary>
        public async Task<List<AppointmentDTO>> GetAppointmentsByDateRangeAsync(Guid businessId, Guid userId, DateTime startDate, DateTime endDate)
        {
            bool isOwner = await _validator.ValidateBusinessOwnerAccessAsync(businessId, userId);

            if (!isOwner)
            {
                throw new UnauthorizedAppointmentAccessException("You do not have permission to view appointments for this business.");
            }

            var appointments = await _appointmentRepository.GetByDateRangeAsync(businessId, startDate, endDate);
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

            // Validate user has access (client, partner, or business owner)
            bool isClient = appointment.ClientId == userId;
            bool isPartner = appointment.PartnerId == userId;
            bool isOwner = await _validator.ValidateBusinessOwnerAccessAsync(appointment.BusinessId, userId);

            if (!isClient && !isPartner && !isOwner)
            {
                throw new UnauthorizedAppointmentAccessException();
            }

            // Validate can cancel
            _validator.ValidateCanCancel(appointment);

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
