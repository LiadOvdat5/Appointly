using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Repositories
{
    public class WeeklyWorkingRuleRepository : IWeeklyWorkingRuleRepository
    {
        private readonly AppDbContext _context;

        public WeeklyWorkingRuleRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<WeeklyWorkingRule?> GetByIdAsync(Guid id)
        {
            return await _context.WeeklyWorkingRules
                .FirstOrDefaultAsync(w => w.Id == id);
        }

        public async Task<List<WeeklyWorkingRule>> GetByServiceIdAsync(Guid serviceId)
        {
            return await _context.WeeklyWorkingRules
                .Where(w => w.ServiceId == serviceId)
                .OrderBy(w => w.DayOfWeek)
                .ToListAsync();
        }

        public async Task<WeeklyWorkingRule> CreateAsync(WeeklyWorkingRule rule)
        {
            rule.Id = Guid.NewGuid();
            rule.CreatedAt = DateTime.UtcNow;

            _context.WeeklyWorkingRules.Add(rule);
            await _context.SaveChangesAsync();
            return rule;
        }

        public async Task<WeeklyWorkingRule> UpdateAsync(WeeklyWorkingRule rule)
        {
            _context.WeeklyWorkingRules.Update(rule);
            await _context.SaveChangesAsync();
            return rule;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var rule = await _context.WeeklyWorkingRules.FindAsync(id);
            if (rule == null)
                return false;

            _context.WeeklyWorkingRules.Remove(rule);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
