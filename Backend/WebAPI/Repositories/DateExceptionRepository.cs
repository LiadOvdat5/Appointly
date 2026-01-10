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
    public class DateExceptionRepository : IDateExceptionRepository
    {
        private readonly AppDbContext _context;

        public DateExceptionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<DateException?> GetByIdAsync(Guid id)
        {
            return await _context.DateExceptions
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<List<DateException>> GetByServiceIdAsync(Guid serviceId)
        {
            return await _context.DateExceptions
                .Where(w => w.ServiceId == serviceId)
                .OrderBy(d => d.Date)
                .ToListAsync();
        }

        public async Task<DateException?> GetByDateAsync(Guid serviceId, DateTime date)
        {
            var dateOnly = date.Date; // Normalize to date only
            return await _context.DateExceptions
                .FirstOrDefaultAsync(d => d.ServiceId == serviceId
                    && d.Date.Date == dateOnly);
        }

        public async Task<DateException> CreateAsync(DateException exception)
        {
            exception.Id = Guid.NewGuid();
            exception.CreatedAt = DateTime.UtcNow;

            _context.DateExceptions.Add(exception);
            await _context.SaveChangesAsync();
            return exception;
        }

        public async Task<DateException> UpdateAsync(DateException exception)
        {
            _context.DateExceptions.Update(exception);
            await _context.SaveChangesAsync();
            return exception;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var exception = await _context.DateExceptions.FindAsync(id);
            if (exception == null)
                return false;

            _context.DateExceptions.Remove(exception);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
