using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Mappers
{
    public static class DateExceptionMapper
    {
        public static DateExceptionDTO ToDTO(DateException exception)
        {
            return new DateExceptionDTO
            {
                Id = exception.Id,
                ServiceId = exception.ServiceId,
                Date = exception.Date,
                IsWorkingDay = exception.IsWorkingDay,
                StartTime = exception.StartTime,
                EndTime = exception.EndTime,
                CreatedAt = exception.CreatedAt
            };
        }

        public static DateException FromCreateDTO(CreateDateExceptionDTO dto)
        {
            return new DateException
            {
                ServiceId = dto.ServiceId,
                Date = dto.Date,
                IsWorkingDay = dto.IsWorkingDay,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime
            };
        }

        public static void UpdateFromDTO(DateException exception, UpdateDateExceptionDTO dto)
        {
            if (dto.Date.HasValue)
                exception.Date = dto.Date.Value;

            if (dto.IsWorkingDay.HasValue)
                exception.IsWorkingDay = dto.IsWorkingDay.Value;

            if (dto.StartTime.HasValue)
                exception.StartTime = dto.StartTime;

            if (dto.EndTime.HasValue)
                exception.EndTime = dto.EndTime;
        }
    }
}
