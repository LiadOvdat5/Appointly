using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Repositories
{
    public class BroadcastRepository : IBroadcastRepository
    {
        private readonly AppDbContext _context;

        public BroadcastRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Broadcast broadcast)
        {
            await _context.Broadcasts.AddAsync(broadcast);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<int> GetRecentCountAsync(Guid businessId, TimeSpan window)
        {
            var cutoff = DateTime.UtcNow - window;
            return await _context.Broadcasts
                .CountAsync(b => b.BusinessId == businessId && b.SentAt >= cutoff);
        }

        public async Task<DateTime?> GetOldestInWindowAsync(Guid businessId, TimeSpan window)
        {
            var cutoff = DateTime.UtcNow - window;
            return await _context.Broadcasts
                .Where(b => b.BusinessId == businessId && b.SentAt >= cutoff)
                .OrderBy(b => b.SentAt)
                .Select(b => (DateTime?)b.SentAt)
                .FirstOrDefaultAsync();
        }

        public async Task<List<Broadcast>> GetPagedAsync(Guid businessId, int page, int pageSize)
        {
            return await _context.Broadcasts
                .Where(b => b.BusinessId == businessId)
                .OrderByDescending(b => b.SentAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetTotalCountAsync(Guid businessId)
        {
            return await _context.Broadcasts
                .CountAsync(b => b.BusinessId == businessId);
        }
    }
}
