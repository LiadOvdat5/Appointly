using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Services
{
    /// <summary>
    /// Background service that runs every hour and sends reminder notifications
    /// for appointments starting in approximately 24 hours.
    /// </summary>
    public class AppointmentReminderService : BackgroundService
    {
        private static readonly TimeSpan CheckInterval = TimeSpan.FromHours(1);

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
                    _logger.LogError(ex, "Error occurred while sending appointment reminders.");
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
            var appointmentRepo  = scope.ServiceProvider.GetRequiredService<IAppointmentRepository>();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

            var due = await appointmentRepo.GetDueForReminderAsync();

            if (due.Count == 0) return;

            _logger.LogInformation("Sending {Count} appointment reminder(s).", due.Count);

            foreach (var appointment in due)
            {
                var serviceName  = appointment.Service?.Name  ?? string.Empty;
                var businessName = appointment.Business?.Name ?? string.Empty;
                var dateLabel    = appointment.StartDateTime.ToLocalTime().ToString("MMM d, h:mm tt");

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

                // Mark reminder sent — prevents duplicates on next run
                appointment.ReminderSentAt = DateTime.UtcNow;
                await appointmentRepo.UpdateAsync(appointment);
            }
        }

        private async Task SendPendingReviewPromptsAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var appointmentRepo     = scope.ServiceProvider.GetRequiredService<IAppointmentRepository>();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

            var due = await appointmentRepo.GetDueForReviewPromptAsync();

            if (due.Count == 0) return;

            _logger.LogInformation("Sending {Count} review prompt(s).", due.Count);

            foreach (var appointment in due)
            {
                var businessName = appointment.Business?.Name ?? string.Empty;

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

                // Mark prompt sent — prevents duplicates on next run
                appointment.ReviewPromptSentAt = DateTime.UtcNow;
                await appointmentRepo.UpdateAsync(appointment);
            }
        }
    }
}
