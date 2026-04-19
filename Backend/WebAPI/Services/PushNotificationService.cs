using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using WebPush;
using WebAPI.Data;
using WebAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Services
{
    public class PushNotificationService : IPushNotificationService
    {
        private readonly IPushSubscriptionRepository _subscriptionRepo;
        private readonly AppDbContext _context;
        private readonly ILogger<PushNotificationService> _logger;
        private readonly VapidDetails? _vapid;

        public PushNotificationService(
            IPushSubscriptionRepository subscriptionRepo,
            AppDbContext context,
            IConfiguration configuration,
            ILogger<PushNotificationService> logger)
        {
            _subscriptionRepo = subscriptionRepo;
            _context = context;
            _logger = logger;

            var subject = configuration["Vapid:Subject"];
            var publicKey = configuration["Vapid:PublicKey"];
            var privateKey = configuration["Vapid:PrivateKey"];

            if (!string.IsNullOrEmpty(publicKey) && !string.IsNullOrEmpty(privateKey))
                _vapid = new VapidDetails(subject ?? "mailto:admin@appointly.app", publicKey, privateKey);
            else
                _logger.LogWarning("VAPID keys not configured — push notifications are disabled.");
        }

        public async Task SendAsync(Guid userId, string title, string body, string url, PushCategory category)
        {
            if (_vapid == null) return;

            // Check user preference for this category
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return;

            var allowed = category switch
            {
                PushCategory.BookingConfirm => user.PushBookingConfirm,
                PushCategory.Cancellations  => user.PushCancellations,
                PushCategory.Reminders24h   => user.PushReminders24h,
                PushCategory.Reminders1h    => user.PushReminders1h,
                PushCategory.ReviewPrompt   => user.PushReviewPrompt,
                PushCategory.Broadcasts     => user.PushBroadcasts,
                _                           => true,
            };
            if (!allowed) return;

            var subscriptions = await _subscriptionRepo.GetByUserIdAsync(userId);
            if (subscriptions.Count == 0) return;

            var payload = JsonSerializer.Serialize(new { title, body, url });
            var stale = new List<Models.PushSubscription>();

            foreach (var sub in subscriptions)
            {
                try
                {
                    var client = new WebPushClient();
                    var pushSub = new WebPush.PushSubscription(sub.Endpoint, sub.P256DH, sub.Auth);
                    await client.SendNotificationAsync(pushSub, payload, _vapid);
                }
                catch (WebPushException ex) when ((int)ex.StatusCode == 410)
                {
                    // Browser endpoint gone — device uninstalled or revoked permission
                    _logger.LogInformation("Stale push subscription (410) for user {UserId}. Queued for removal.", userId);
                    stale.Add(sub);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Push notification failed for user {UserId}. Continuing.", userId);
                }
            }

            if (stale.Count > 0)
            {
                foreach (var s in stale)
                    await _subscriptionRepo.DeleteAsync(s);
                await _subscriptionRepo.SaveChangesAsync();
            }
        }
    }
}
