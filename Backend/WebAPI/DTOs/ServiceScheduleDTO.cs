using System;
using WebAPI.Models;

namespace WebAPI.DTOs
{
    public class ServiceScheduleDTO
    {
        public Guid Id { get; set; }
        public Guid ServiceId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public ScheduleStatus Status { get; set; }
        /// <summary>
        /// Set when Status == BLOCKED due to a parallel-booking conflict.
        /// Identifies which appointment triggered the block.
        /// </summary>
        public Guid? BlockingAppointmentId { get; set; }
        /// <summary>
        /// Human-readable name of the service whose booking caused this block.
        /// Only populated for owner-facing slot views (includeBlocked=true).
        /// </summary>
        public string? BlockingServiceName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
