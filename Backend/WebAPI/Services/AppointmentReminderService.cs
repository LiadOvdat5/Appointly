using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using WebAPI.Data;
using WebAPI.Interfaces;
using WebAPI.Models;
using WebAPI.Utilities;

namespace WebAPI.Services
{
    /// <summary>
    /// Background service that runs every 15 minutes:
    ///  - Sends 24h in-app + push reminder for upcoming appointments
    ///  - Sends 1h push-only reminder for imminent appointments
    ///  - Sends post-appointment review prompt notifications
    /// </summary>
    public class AppointmentReminderService : BackgroundService
    {
        private static readonly TimeSpan CheckInterval = TimeSpan.FromMinutes(15);

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AppointmentReminderService> _logger;

        public AppointmentReminderService(
            IServiceScopeFactory scopeFactory,
            ILogger<AppointmentReminderService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("AppointmentReminderService started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await SendPendingRemindersAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while sending 24h appointment reminders.");
                }

                try
                {
                    await Send1hPushRemindersAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while sending 1h push reminders.");
                }

                try
                {
                    await SendPendingReviewPromptsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while sending review prompt notifications.");
                }

                await Task.Delay(CheckInterval, stoppingToken);
            }

            _logger.LogInformation("AppointmentReminderService stopped.");
        }

        private async Task SendPendingRemindersAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var appointmentRepo     = scope.ServiceProvider.GetRequiredService<IAppointmentRepository>();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
            var pushService         = scope.ServiceProvider.GetRequiredService<IPushNotificationService>();
            var db                  = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var due = await appointmentRepo.GetDueForReminderAsync();
            if (due.Count == 0) return;

            _logger.LogInformation("Sending {Count} 24h appointment reminder(s).", due.Count);

            foreach (var appointment in due)
            {
                var serviceName  = appointment.Service?.Name  ?? string.Empty;
                var businessName = appointment.Business?.Name ?? string.Empty;
                var dateLabel    = appointment.StartDateTime.ToLocalTime().ToString("MMM d, h:mm tt");
                var timeLabel    = appointment.StartDateTime.ToLocalTime().ToString("h:mm tt");

                await notificationService.CreateNotificationAsync(
                    userId: appointment.ClientId,
                    titleKey: "notifications.appointmentReminder.title",
                    bodyKey: "notifications.appointmentReminder.body",
                    type: NotificationType.AppointmentReminder,
                    relatedEntityId: appointment.Id,
                    targetPath: "/customer-dashboard",
                    bodyParams: new Dictionary<string, string>
                    {
                        ["serviceName"]  = serviceName,
                        ["businessName"] = businessName,
                        ["date"]         = dateLabel
                    });

                var lang = await GetUserLang(db, appointment.ClientId);
                var (rTitle, rBody) = PushText.Reminder24h(lang, serviceName, businessName, timeLabel);
                await pushService.SendAsync(appointment.ClientId, rTitle, rBody, "/customer-dashboard", PushCategory.Reminders24h);

                appointment.ReminderSentAt = DateTime.UtcNow;
                await appointmentRepo.UpdateAsync(appointment);
            }
        }

        private async Task Send1hPushRemindersAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var appointmentRepo = scope.ServiceProvider.GetRequiredService<IAppointmentRepository>();
            var pushService     = scope.ServiceProvider.GetRequiredService<IPushNotificationService>();
            var db              = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var due = await appointmentRepo.GetDueFor1hReminderAsync();
            if (due.Count == 0) return;

            _logger.LogInformation("Sending {Count} 1h push reminder(s).", due.Count);

            foreach (var appointment in due)
            {
                var serviceName  = appointment.Service?.Name  ?? string.Empty;
                var businessName = appointment.Business?.Name ?? string.Empty;

                var lang = await GetUserLang(db, appointment.ClientId);
                var (rTitle, rBody) = PushText.Reminder1h(lang, serviceName, businessName);
                await pushService.SendAsync(appointment.ClientId, rTitle, rBody, "/customer-dashboard", PushCategory.Reminders1h);

                appointment.ReminderSent1hAt = DateTime.UtcNow;
                await appointmentRepo.UpdateAsync(appointment);
            }
        }

        private async Task SendPendingReviewPromptsAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var appointmentRepo     = scope.ServiceProvider.GetRequiredService<IAppointmentRepository>();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();
            var pushService         = scope.ServiceProvider.GetRequiredService<IPushNotificationService>();
            var db                  = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var due = await appointmentRepo.GetDueForReviewPromptAsync();
            if (due.Count == 0) return;

            _logger.LogInformation("Sending {Count} review prompt(s).", due.Count);

            foreach (var appointment in due)
            {
                var businessName = appointment.Business?.Name ?? string.Empty;
                var businessId   = appointment.BusinessId;

                await notificationService.CreateNotificationAsync(
                    userId: appointment.ClientId,
                    titleKey: "notifications.reviewPrompt.title",
                    bodyKey: "notifications.reviewPrompt.body",
                    type: NotificationType.ReviewPrompt,
                    relatedEntityId: appointment.Id,
                    targetPath: $"/customer-dashboard?review={appointment.Id}",
                    bodyParams: new Dictionary<string, string>
                    {
                        ["businessName"] = businessName
                    });

                var lang = await GetUserLang(db, appointment.ClientId);
                var (rpTitle, rpBody) = PushText.ReviewPrompt(lang, businessName);
                await pushService.SendAsync(appointment.ClientId, rpTitle, rpBody, $"/business/{businessId}#reviews", PushCategory.ReviewPrompt);

                appointment.ReviewPromptSentAt = DateTime.UtcNow;
                await appointmentRepo.UpdateAsync(appointment);
            }
        }

        private static async Task<string> GetUserLang(AppDbContext db, Guid userId)
        {
            var lang = await db.Users
                .Where(u => u.Id == userId)
                .Select(u => u.PreferredLanguage)
                .FirstOrDefaultAsync();
            return string.IsNullOrEmpty(lang) ? "en" : lang;
        }
    }
}
