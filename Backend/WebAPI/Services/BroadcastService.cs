using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Services
{
    public class BroadcastService : IBroadcastService
    {
        private const int DailyLimit = 3;
        private static readonly TimeSpan Window = TimeSpan.FromHours(24);

        private readonly IBroadcastRepository _broadcastRepo;
        private readonly IFollowRepository _followRepo;
        private readonly BroadcastFanoutQueue _queue;

        public BroadcastService(
            IBroadcastRepository broadcastRepo,
            IFollowRepository followRepo,
            BroadcastFanoutQueue queue)
        {
            _broadcastRepo = broadcastRepo;
            _followRepo    = followRepo;
            _queue         = queue;
        }

        public async Task<BroadcastDTO> SendAsync(Guid businessId, CreateBroadcastDTO dto)
        {
            var recentCount = await _broadcastRepo.GetRecentCountAsync(businessId, Window);
            if (recentCount >= DailyLimit)
                throw new InvalidOperationException("rate_limited");

            var followerCount = await _followRepo.GetFollowerCountAsync(businessId);

            var broadcast = new Broadcast
            {
                Id            = Guid.NewGuid(),
                BusinessId    = businessId,
                Title         = dto.Title.Trim(),
                Body          = dto.Body.Trim(),
                SentAt        = DateTime.UtcNow,
                FollowerCount = followerCount,
            };

            await _broadcastRepo.AddAsync(broadcast);
            await _broadcastRepo.SaveChangesAsync();

            // Enqueue async fan-out — HTTP request returns before this completes
            _queue.Enqueue(broadcast.Id);

            return ToDTO(broadcast);
        }

        public async Task<(List<BroadcastDTO> Items, int Total)> GetHistoryAsync(
            Guid businessId, int page, int pageSize)
        {
            var items = await _broadcastRepo.GetPagedAsync(businessId, page, pageSize);
            var total = await _broadcastRepo.GetTotalCountAsync(businessId);
            return (items.Select(ToDTO).ToList(), total);
        }

        public async Task<BroadcastStatusDTO> GetStatusAsync(Guid businessId)
        {
            var count    = await _broadcastRepo.GetRecentCountAsync(businessId, Window);
            var oldest   = await _broadcastRepo.GetOldestInWindowAsync(businessId, Window);
            DateTime? resetsAt = oldest.HasValue ? oldest.Value + Window : null;

            return new BroadcastStatusDTO
            {
                SentToday  = count,
                DailyLimit = DailyLimit,
                ResetsAt   = resetsAt,
            };
        }

        private static BroadcastDTO ToDTO(Broadcast b) => new()
        {
            Id            = b.Id,
            BusinessId    = b.BusinessId,
            Title         = b.Title,
            Body          = b.Body,
            SentAt        = b.SentAt,
            FollowerCount = b.FollowerCount,
        };
    }
}
