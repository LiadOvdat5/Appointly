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
    public class BreakRuleRepository : IBreakRuleRepository
    {
        private readonly AppDbContext _context;

        public BreakRuleRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<BreakRule?> GetByIdAsync(Guid id)
        {
            return await _context.BreakRules
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<List<BreakRule>> GetByServiceIdAsync(Guid serviceId)
        {
            return await _context.BreakRules
                .Where(w => w.ServiceId == serviceId)
                .OrderBy(b => b.StartTime)
                .ToListAsync();
        }

        public async Task<BreakRule> CreateAsync(BreakRule rule)
        {
            rule.Id = Guid.NewGuid();
            rule.CreatedAt = DateTime.UtcNow;

            _context.BreakRules.Add(rule);
            await _context.SaveChangesAsync();
            return rule;
        }

        public async Task<BreakRule> UpdateAsync(BreakRule rule)
        {
            _context.BreakRules.Update(rule);
            await _context.SaveChangesAsync();
            return rule;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var rule = await _context.BreakRules.FindAsync(id);
            if (rule == null)
                return false;

            _context.BreakRules.Remove(rule);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
