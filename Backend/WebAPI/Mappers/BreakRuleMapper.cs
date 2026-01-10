using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Mappers
{
    public static class BreakRuleMapper
    {
        public static BreakRuleDTO ToDTO(BreakRule rule)
        {
            return new BreakRuleDTO
            {
                Id = rule.Id,
                ServiceId = rule.ServiceId,
                DayOfWeek = rule.DayOfWeek,
                StartTime = rule.StartTime,
                EndTime = rule.EndTime,
                StartDate = rule.StartDate,
                EndDate = rule.EndDate,
                CreatedAt = rule.CreatedAt
            };
        }

        public static BreakRule FromCreateDTO(CreateBreakRuleDTO dto)
        {
            return new BreakRule
            {
                ServiceId = dto.ServiceId,
                DayOfWeek = dto.DayOfWeek,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate
            };
        }

        public static void UpdateFromDTO(BreakRule rule, UpdateBreakRuleDTO dto)
        {
            if (dto.DayOfWeek.HasValue)
                rule.DayOfWeek = dto.DayOfWeek.Value;

            if (dto.StartTime.HasValue)
                rule.StartTime = dto.StartTime.Value;

            if (dto.EndTime.HasValue)
                rule.EndTime = dto.EndTime.Value;

            if (dto.StartDate.HasValue)
                rule.StartDate = dto.StartDate;

            if (dto.EndDate.HasValue)
                rule.EndDate = dto.EndDate;
        }
    }
}
