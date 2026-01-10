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
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
