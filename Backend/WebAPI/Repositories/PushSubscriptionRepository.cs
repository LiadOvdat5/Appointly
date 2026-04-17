using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Repositories
{
    public class PushSubscriptionRepository : IPushSubscriptionRepository
    {
        private readonly AppDbContext _context;

        public PushSubscriptionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PushSubscription?> GetByEndpointAsync(string endpoint)
            => await _context.PushSubscriptions.FirstOrDefaultAsync(s => s.Endpoint == endpoint);

        public async Task<List<PushSubscription>> GetByUserIdAsync(Guid userId)
            => await _context.PushSubscriptions.Where(s => s.UserId == userId).ToListAsync();

        public async Task AddAsync(PushSubscription subscription)
            => await _context.PushSubscriptions.AddAsync(subscription);

        public async Task DeleteAsync(PushSubscription subscription)
            => _context.PushSubscriptions.Remove(subscription);

        public async Task SaveChangesAsync()
            => await _context.SaveChangesAsync();
    }
}
