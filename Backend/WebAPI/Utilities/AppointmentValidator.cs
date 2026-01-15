using System;
using System.Threading.Tasks;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Utilities
{
    public class AppointmentValidator
    {
        private readonly IServiceScheduleRepository _scheduleRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly IBusinessRepository _businessRepository;

        public AppointmentValidator(
            IServiceScheduleRepository scheduleRepository,
            IServiceRepository serviceRepository,
            IBusinessRepository businessRepository)
        {
            _scheduleRepository = scheduleRepository;
            _serviceRepository = serviceRepository;
            _businessRepository = businessRepository;
        }

        /// <summary>
        /// Validate that a slot is available for booking
        /// </summary>
        public async Task ValidateSlotAvailabilityAsync(Guid scheduleId)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(scheduleId);

            if (schedule == null)
            {
                throw new SlotUnavailableException($"Service schedule with ID '{scheduleId}' not found.");
            }

            if (schedule.Status != ScheduleStatus.AVAILABLE)
            {
                throw new SlotUnavailableException($"This time slot is {schedule.Status.ToString().ToLower()} and cannot be booked.");
            }
        }

        /// <summary>
        /// Validate that the service and schedule match
        /// </summary>
        public async Task<ServiceSchedule> ValidateServiceScheduleMatchAsync(Guid serviceId, Guid scheduleId)
        {
            var schedule = await _scheduleRepository.GetByIdAsync(scheduleId);

            if (schedule == null)
            {
                throw new SlotUnavailableException($"Service schedule with ID '{scheduleId}' not found.");
            }

            if (schedule.ServiceId != serviceId)
            {
                throw new InvalidAppointmentOperationException("The selected time slot does not belong to the specified service.");
            }

            return schedule;
        }

        /// <summary>
        /// Validate that the appointment date is within business advance booking limits
        /// </summary>
        public async Task ValidateAdvanceBookingAsync(Guid businessId, DateTime appointmentStartTime)
        {
            var business = await _businessRepository.GetBusinessEntityByIdAsync(businessId);

            if (business == null)
            {
                throw new InvalidAppointmentOperationException($"Business with ID '{businessId}' not found.");
            }

            var maxAdvanceDate = DateTime.UtcNow.AddDays(business.AdvanceBookingDays);

            if (appointmentStartTime > maxAdvanceDate)
            {
                throw new InvalidAppointmentOperationException(
                    $"Appointments can only be booked up to {business.AdvanceBookingDays} days in advance. " +
                    $"The selected date exceeds this limit.");
            }
        }

        /// <summary>
        /// Validate that the appointment is not in the past
        /// </summary>
        public void ValidateNotInPast(DateTime appointmentStartTime)
        {
            if (appointmentStartTime < DateTime.UtcNow)
            {
                throw new InvalidAppointmentOperationException("Cannot book appointments in the past.");
            }
        }

        /// <summary>
        /// Validate appointment can be canceled
        /// </summary>
        public void ValidateCanCancel(Appointment appointment)
        {
            if (appointment.Status == AppointmentStatus.canceled)
            {
                throw new AppointmentAlreadyCanceledException(appointment.Id);
            }

            if (appointment.Status == AppointmentStatus.completed)
            {
                throw new AppointmentAlreadyCompletedException(
                    "Cannot cancel a completed appointment.");
            }
        }

        /// <summary>
        /// Validate user has permission to access appointment
        /// </summary>
        public void ValidateUserAccess(Appointment appointment, Guid userId, bool requireOwnership = false)
        {
            bool isClient = appointment.ClientId == userId;
            bool isPartner = appointment.PartnerId == userId;

            if (requireOwnership && !isClient)
            {
                throw new UnauthorizedAppointmentAccessException(
                    "Only the client who booked the appointment can perform this action.");
            }

            if (!isClient && !isPartner)
            {
                throw new UnauthorizedAppointmentAccessException(
                    "You do not have permission to access this appointment.");
            }
        }

        /// <summary>
        /// Validate business owner access
        /// </summary>
        public async Task<bool> ValidateBusinessOwnerAccessAsync(Guid businessId, Guid userId)
        {
            var business = await _businessRepository.GetBusinessEntityByIdAsync(businessId);
            return business?.OwnerId == userId;
        }
    }
}
