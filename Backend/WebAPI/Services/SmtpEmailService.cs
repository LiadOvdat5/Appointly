using System.Net;
using System.Net.Mail;
using WebAPI.Interfaces;

namespace WebAPI.Services
{
    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<SmtpEmailService> _logger;

        public SmtpEmailService(IConfiguration config, ILogger<SmtpEmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            var smtp = _config.GetSection("Smtp");
            var host = smtp["Host"] ?? throw new InvalidOperationException("Smtp:Host is not configured.");
            var port = int.Parse(smtp["Port"] ?? "587");
            var username = smtp["Username"] ?? throw new InvalidOperationException("Smtp:Username is not configured.");
            var password = smtp["Password"] ?? throw new InvalidOperationException("Smtp:Password is not configured.");
            var fromEmail = smtp["FromEmail"] ?? username;
            var fromName = smtp["FromName"] ?? "Appointly";

            using var client = new SmtpClient(host, port)
            {
                Credentials = new NetworkCredential(username, password),
                EnableSsl = true
            };

            var message = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true
            };
            message.To.Add(toEmail);

            await client.SendMailAsync(message);
            _logger.LogInformation("Email sent to {ToEmail} — subject: {Subject}", toEmail, subject);
        }
    }
}
