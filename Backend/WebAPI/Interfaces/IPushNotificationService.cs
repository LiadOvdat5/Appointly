namespace WebAPI.Interfaces
{
    /// <summary>
    /// Categories used to gate push sends against user preferences.
    /// Each value maps 1-to-1 to a Push* column on the Users table.
    /// </summary>
    public enum PushCategory
    {
        BookingConfirm,
        Cancellations,
        Reminders24h,
        Reminders1h,
        ReviewPrompt,
        Broadcasts,
    }

    public interface IPushNotificationService
    {
        /// <summary>
        /// Sends a push notification to all active subscriptions for the given user.
        /// Checks the user's push preference for the supplied category; skips if disabled.
        /// Skips silently if the user has no subscriptions or push is not configured.
        /// Never throws — failures are logged and stale subscriptions are cleaned up.
        /// </summary>
        Task SendAsync(Guid userId, string title, string body, string url, PushCategory category);
    }
}
