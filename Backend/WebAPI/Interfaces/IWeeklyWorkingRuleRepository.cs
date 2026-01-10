using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface IWeeklyWorkingRuleRepository
    {
        Task<WeeklyWorkingRule?> GetByIdAsync(Guid id);
        Task<List<WeeklyWorkingRule>> GetByServiceIdAsync(Guid serviceId);
        Task<WeeklyWorkingRule> CreateAsync(WeeklyWorkingRule rule);
        Task<WeeklyWorkingRule> UpdateAsync(WeeklyWorkingRule rule);
        Task<bool> DeleteAsync(Guid id);
    }
}
