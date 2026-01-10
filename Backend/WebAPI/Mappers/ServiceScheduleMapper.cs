using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Mappers
{
    public static class ServiceScheduleMapper
    {
        public static ServiceScheduleDTO ToDTO(ServiceSchedule schedule)
        {
            return new ServiceScheduleDTO
            {
                Id = schedule.Id,
                ServiceId = schedule.ServiceId,
                StartDateTime = schedule.StartDateTime,
                EndDateTime = schedule.EndDateTime,
                Status = schedule.Status,
                CreatedAt = schedule.CreatedAt,
                UpdatedAt = schedule.UpdatedAt
            };
        }
    }
}
