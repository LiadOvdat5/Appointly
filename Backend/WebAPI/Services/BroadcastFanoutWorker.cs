using System.Threading.Channels;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Services
{
    /// <summary>
    /// Singleton in-process queue. The HTTP handler enqueues a broadcastId;
    /// BroadcastFanoutWorker drains it in the background.
    /// </summary>
    public sealed class BroadcastFanoutQueue
    {
        private readonly Channel<Guid> _channel = Channel.CreateUnbounded<Guid>(
            new UnboundedChannelOptions { SingleReader = true });

        public void Enqueue(Guid broadcastId) => _channel.Writer.TryWrite(broadcastId);

        public ChannelReader<Guid> Reader => _channel.Reader;
    }

    /// <summary>
    /// Drains the BroadcastFanoutQueue: for each broadcastId, fetches all
    /// follower IDs then creates one in-app notification + push per follower.
    /// </summary>
    public sealed class BroadcastFanoutWorker : BackgroundService
    {
        private readonly BroadcastFanoutQueue _queue;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<BroadcastFanoutWorker> _logger;

        public BroadcastFanoutWorker(
            BroadcastFanoutQueue queue,
            IServiceScopeFactory scopeFactory,
            ILogger<BroadcastFanoutWorker> logger)
        {
            _queue = queue;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await foreach (var broadcastId in _queue.Reader.ReadAllAsync(stoppingToken))
            {
                try
                {
                    await FanOutAsync(broadcastId, stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Fan-out failed for broadcast {BroadcastId}.", broadcastId);
                }
            }
        }

        private async Task FanOutAsync(Guid broadcastId, CancellationToken ct)
        {
            using var scope = _scopeFactory.CreateScope();
            var broadcastRepo = scope.ServiceProvider.GetRequiredService<IBroadcastRepository>();
            var followRepo    = scope.ServiceProvider.GetRequiredService<IFollowRepository>();
            var notifService  = scope.ServiceProvider.GetRequiredService<INotificationService>();
            var pushService   = scope.ServiceProvider.GetRequiredService<IPushNotificationService>();
            var db            = scope.ServiceProvider.GetRequiredService<Data.AppDbContext>();

            var broadcast = await db.Broadcasts
                .Include(b => b.Business)
                .FirstOrDefaultAsync(b => b.Id == broadcastId, ct);

            if (broadcast?.Business == null)
            {
                _logger.LogWarning("Broadcast {BroadcastId} not found — skipping fan-out.", broadcastId);
                return;
            }

            var followerIds = await followRepo.GetFollowerIdsAsync(broadcast.BusinessId);

            _logger.LogInformation(
                "Fan-out broadcast {BroadcastId} to {Count} followers.",
                broadcastId, followerIds.Count);

            foreach (var userId in followerIds)
            {
                // In-app notification — title = broadcast title, businessName in bodyParams
                await notifService.CreateNotificationAsync(
                    userId,
                    broadcast.Title,
                    broadcast.Body,
                    NotificationType.BusinessBroadcast,
                    relatedEntityId: broadcast.Id,
                    targetPath: $"/business/{broadcast.Business.Slug}",
                    bodyParams: new Dictionary<string, string>
                    {
                        ["businessName"] = broadcast.Business.Name,
                    });

                // Push notification — title = business name so device shows who sent it
                await pushService.SendAsync(
                    userId,
                    broadcast.Business.Name,
                    broadcast.Body,
                    $"/business/{broadcast.Business.Slug}",
                    PushCategory.Broadcasts);
            }

            _logger.LogInformation("Fan-out complete for broadcast {BroadcastId}.", broadcastId);
        }
    }
}
