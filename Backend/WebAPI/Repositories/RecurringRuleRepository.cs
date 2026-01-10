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
    public class RecurringRuleRepository : IRecurringRuleRepository
    {
        private readonly AppDbContext _context;

        public RecurringRuleRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<RecurringRule?> GetByIdAsync(Guid id)
        {
            return await _context.RecurringRules
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<List<RecurringRule>> GetByServiceIdAsync(Guid serviceId)
        {
            return await _context.RecurringRules
                .Where(w => w.ServiceId == serviceId)
                .OrderBy(r => r.StartDate)
                .ToListAsync();
        }

        public async Task<RecurringRule> CreateAsync(RecurringRule rule)
        {
            rule.Id = Guid.NewGuid();
            rule.CreatedAt = DateTime.UtcNow;

            _context.RecurringRules.Add(rule);
            await _context.SaveChangesAsync();
            return rule;
        }

        public async Task<RecurringRule> UpdateAsync(RecurringRule rule)
        {
            _context.RecurringRules.Update(rule);
            await _context.SaveChangesAsync();
            return rule;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var rule = await _context.RecurringRules.FindAsync(id);
            if (rule == null)
                return false;

            _context.RecurringRules.Remove(rule);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
