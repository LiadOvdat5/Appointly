using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface IRecurringRuleRepository
    {
        Task<RecurringRule?> GetByIdAsync(Guid id);
        Task<List<RecurringRule>> GetByServiceIdAsync(Guid serviceId);
        Task<RecurringRule> CreateAsync(RecurringRule rule);
        Task<RecurringRule> UpdateAsync(RecurringRule rule);
        Task<bool> DeleteAsync(Guid id);
    }
}
