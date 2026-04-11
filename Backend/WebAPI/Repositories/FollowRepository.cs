using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Mappers;
using WebAPI.Models;

namespace WebAPI.Repositories
{
    public class FollowRepository : IFollowRepository
    {
        private readonly AppDbContext _context;

        public FollowRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<FollowDTO> FollowAsync(Guid userId, Guid businessId)
        {
            var existing = await _context.Follows
                .FirstOrDefaultAsync(f => f.UserId == userId && f.BusinessId == businessId);

            if (existing != null)
                throw new InvalidOperationException("You are already following this business.");

            var businessExists = await _context.Businesses.AnyAsync(b => b.Id == businessId);
            if (!businessExists)
                throw new KeyNotFoundException($"Business with ID {businessId} not found.");

            var follow = new Follow
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                BusinessId = businessId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Follows.Add(follow);
            await _context.SaveChangesAsync();

            return new FollowDTO
            {
                Id = follow.Id,
                UserId = follow.UserId,
                BusinessId = follow.BusinessId,
                CreatedAt = follow.CreatedAt
            };
        }

        public async Task<bool> UnfollowAsync(Guid userId, Guid businessId)
        {
            var follow = await _context.Follows
                .FirstOrDefaultAsync(f => f.UserId == userId && f.BusinessId == businessId);

            if (follow == null)
                return false;

            _context.Follows.Remove(follow);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<BusinessDTO>> GetFollowedBusinessesAsync(Guid userId)
        {
            var followedBusinessIds = await _context.Follows
                .Where(f => f.UserId == userId)
                .Select(f => f.BusinessId)
                .ToListAsync();

            if (!followedBusinessIds.Any())
                return Enumerable.Empty<BusinessDTO>();

            var businesses = await _context.Businesses
                .Where(b => followedBusinessIds.Contains(b.Id))
                .ToListAsync();

            var result = new List<BusinessDTO>();
            foreach (var business in businesses)
            {
                var categoryGuids = business.CategoryIds?
                    .Select(Guid.Parse)
                    .ToList() ?? new List<Guid>();

                var categories = categoryGuids.Any()
                    ? await _context.Categories
                        .Where(c => categoryGuids.Contains(c.Id))
                        .Select(c => new CategoryDTO { Id = c.Id, Name = c.Name, Description = c.Description, IconName = c.IconName })
                        .ToListAsync()
                    : new List<CategoryDTO>();

                result.Add(BusinessMapper.ToBusinessDTO(business, categories));
            }

            return result;
        }

        public async Task<FollowStatusDTO> GetFollowStatusAsync(Guid userId, Guid businessId)
        {
            var follow = await _context.Follows
                .FirstOrDefaultAsync(f => f.UserId == userId && f.BusinessId == businessId);

            return new FollowStatusDTO
            {
                IsFollowing = follow != null,
                FollowId = follow?.Id
            };
        }

        public async Task<int> GetFollowerCountAsync(Guid businessId)
        {
            return await _context.Follows
                .CountAsync(f => f.BusinessId == businessId);
        }
    }
}
