using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface IBreakRuleRepository
    {
        Task<BreakRule?> GetByIdAsync(Guid id);
        Task<List<BreakRule>> GetByServiceIdAsync(Guid serviceId);
        Task<BreakRule> CreateAsync(BreakRule rule);
        Task<BreakRule> UpdateAsync(BreakRule rule);
        Task<bool> DeleteAsync(Guid id);
    }
}
