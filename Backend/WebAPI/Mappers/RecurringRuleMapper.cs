using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Mappers
{
    public static class RecurringRuleMapper
    {
        public static RecurringRuleDTO ToDTO(RecurringRule rule)
        {
            return new RecurringRuleDTO
            {
                Id = rule.Id,
                ServiceId = rule.ServiceId,
                StartDate = rule.StartDate,
                EndDate = rule.EndDate,
                DaysOfWeek = rule.DaysOfWeek,
                StartTime = rule.StartTime,
                EndTime = rule.EndTime,
                CreatedAt = rule.CreatedAt
            };
        }

        public static RecurringRule FromCreateDTO(CreateRecurringRuleDTO dto)
        {
            return new RecurringRule
            {
                ServiceId = dto.ServiceId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                DaysOfWeek = dto.DaysOfWeek,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime
            };
        }

        public static void UpdateFromDTO(RecurringRule rule, UpdateRecurringRuleDTO dto)
        {
            if (dto.StartDate.HasValue)
                rule.StartDate = dto.StartDate.Value;

            if (dto.EndDate.HasValue)
                rule.EndDate = dto.EndDate.Value;

            if (!string.IsNullOrEmpty(dto.DaysOfWeek))
                rule.DaysOfWeek = dto.DaysOfWeek;

            if (dto.StartTime.HasValue)
                rule.StartTime = dto.StartTime.Value;

            if (dto.EndTime.HasValue)
                rule.EndTime = dto.EndTime.Value;
        }
    }
}
