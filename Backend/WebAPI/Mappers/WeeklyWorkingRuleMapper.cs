using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Mappers
{
    public static class WeeklyWorkingRuleMapper
    {
        public static WeeklyWorkingRuleDTO ToDTO(WeeklyWorkingRule rule)
        {
            return new WeeklyWorkingRuleDTO
            {
                Id = rule.Id,
                ServiceId = rule.ServiceId,
                DayOfWeek = rule.DayOfWeek,
                IsWorkingDay = rule.IsWorkingDay,
                StartTime = rule.StartTime,
                EndTime = rule.EndTime,
                CreatedAt = rule.CreatedAt
            };
        }

        public static WeeklyWorkingRule FromCreateDTO(CreateWeeklyWorkingRuleDTO dto)
        {
            return new WeeklyWorkingRule
            {
                ServiceId = dto.ServiceId,
                DayOfWeek = dto.DayOfWeek,
                IsWorkingDay = dto.IsWorkingDay,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime
            };
        }

        public static void UpdateFromDTO(WeeklyWorkingRule rule, UpdateWeeklyWorkingRuleDTO dto)
        {
            if (dto.DayOfWeek.HasValue)
                rule.DayOfWeek = dto.DayOfWeek.Value;

            if (dto.IsWorkingDay.HasValue)
                rule.IsWorkingDay = dto.IsWorkingDay.Value;

            if (dto.StartTime.HasValue)
                rule.StartTime = dto.StartTime.Value;

            if (dto.EndTime.HasValue)
                rule.EndTime = dto.EndTime.Value;
        }
    }
}
