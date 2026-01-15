using System;
using WebAPI.Models;

namespace WebAPI.DTOs
{
    public class AppointmentDTO
    {
        public Guid Id { get; set; }

        // Client Information
        public Guid ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string? ClientEmail { get; set; }
        public string? ClientPhone { get; set; }

        // Partner Information
        public Guid PartnerId { get; set; }
        public string PartnerName { get; set; } = string.Empty;
        public string? PartnerEmail { get; set; }

        // Service Information
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public string? ServiceDescription { get; set; }
        public int ServiceDuration { get; set; }
        public decimal? ServicePrice { get; set; }

        // Business Information
        public Guid BusinessId { get; set; }
        public string BusinessName { get; set; } = string.Empty;
        public string? BusinessAddress { get; set; }
        public string? BusinessPhone { get; set; }

        // Schedule Information
        public Guid ServiceScheduleId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }

        // Appointment Details
        public string? Notes { get; set; }
        public AppointmentStatus Status { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
