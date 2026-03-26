using System;
using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Mappers
{
    public static class AppointmentMapper
    {
        /// <summary>
        /// Map Appointment entity to AppointmentDTO
        /// </summary>
        public static AppointmentDTO ToDTO(Appointment appointment)
        {
            if (appointment == null)
                throw new ArgumentNullException(nameof(appointment));

            return new AppointmentDTO
            {
                Id = appointment.Id,
                ConfirmationCode = appointment.ConfirmationCode,

                // Client Information
                ClientId = appointment.ClientId,
                ClientName = appointment.Client?.Name ?? string.Empty,
                ClientEmail = appointment.Client?.Email,
                ClientPhone = appointment.Client?.Phone,

                // Partner Information
                PartnerId = appointment.PartnerId,
                PartnerName = appointment.Partner?.Name ?? string.Empty,
                PartnerEmail = appointment.Partner?.Email,

                // Service Information
                ServiceId = appointment.ServiceId,
                ServiceName = appointment.Service?.Name ?? string.Empty,
                ServiceDescription = appointment.Service?.Description,
                ServiceDuration = appointment.Service?.Duration ?? 0,
                ServicePrice = appointment.Service?.Price,

                // Business Information
                BusinessId = appointment.BusinessId,
                BusinessName = appointment.Business?.Name ?? string.Empty,
                BusinessAddress = appointment.Business?.Address,
                BusinessPhone = appointment.Business?.Phone,

                // Schedule Information
                ServiceScheduleId = appointment.ServiceScheduleId,
                StartDateTime = appointment.StartDateTime,
                EndDateTime = appointment.EndDateTime,

                // Appointment Details
                Notes = appointment.Notes,
                Status = appointment.Status,

                // Timestamps
                CreatedAt = appointment.CreatedAt,
                UpdatedAt = appointment.UpdatedAt
            };
        }

        /// <summary>
        /// Map CreateAppointmentDTO to Appointment entity
        /// </summary>
        public static Appointment ToEntity(CreateAppointmentDTO dto, Guid clientId, Guid businessId, Guid partnerId, DateTime startDateTime, DateTime endDateTime)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            return new Appointment
            {
                Id = Guid.NewGuid(),
                ConfirmationCode = Guid.NewGuid().ToString("N")[..8].ToUpper(),
                ClientId = clientId,
                ServiceId = dto.ServiceId,
                BusinessId = businessId,
                PartnerId = partnerId,
                ServiceScheduleId = dto.ServiceScheduleId,
                StartDateTime = startDateTime,
                EndDateTime = endDateTime,
                Notes = dto.Notes,
                Status = AppointmentStatus.scheduled,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Update Appointment entity from UpdateAppointmentDTO
        /// </summary>
        public static void UpdateFromDTO(Appointment appointment, UpdateAppointmentDTO dto)
        {
            if (appointment == null)
                throw new ArgumentNullException(nameof(appointment));
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            if (dto.Status.HasValue)
            {
                appointment.Status = dto.Status.Value;
            }

            if (dto.Notes != null)
            {
                appointment.Notes = dto.Notes;
            }

            appointment.UpdatedAt = DateTime.UtcNow;
        }
    }
}
