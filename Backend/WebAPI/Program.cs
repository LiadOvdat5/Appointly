using Scalar.AspNetCore;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.Interfaces;
using WebAPI.Repositories;
using WebAPI.Services;
using WebAPI.Utilities;
using Microsoft.IdentityModel.Tokens;
using Microsoft.CodeAnalysis.Options;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi("v1", options =>
{
    options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
    options.AddDocumentTransformer<CookieSecuritySchemeTransformer>();

});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS Policy
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .WithHeaders("Content-Type", "Authorization", "X-Requested-With")
            .AllowCredentials();
    });
});



// Rate limiting — auth endpoints: 10 requests per IP per minute
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                QueueLimit = 0
            }));

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// Register AdminRepository
builder.Services.AddScoped<IAdminRepository, AdminRepository>();

// Register DemoDataSeeder
builder.Services.AddScoped<WebAPI.Data.DemoDataSeeder>();

// Register AuthRepository and JwtService
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBusinessRepository, BusinessRepository>();
builder.Services.AddScoped<IBusinessInvitationRepository, BusinessInvitationRepository>();
builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ISearchRepository, SearchRepository>();
builder.Services.AddScoped<IStaffRepository, StaffRepository>();

// Register Schedule & Availability Repositories
builder.Services.AddScoped<IWeeklyWorkingRuleRepository, WeeklyWorkingRuleRepository>();
builder.Services.AddScoped<IBreakRuleRepository, BreakRuleRepository>();
builder.Services.AddScoped<IRecurringRuleRepository, RecurringRuleRepository>();
builder.Services.AddScoped<IDateExceptionRepository, DateExceptionRepository>();
builder.Services.AddScoped<IServiceScheduleRepository, ServiceScheduleRepository>();

// Register Schedule & Availability Services
builder.Services.AddScoped<SlotGenerationService>();
// builder.Services.AddScoped<AvailabilityRulesService>(); // Disabled during refactor

// Register Appointment Services
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<AppointmentValidator>();

// Register Report Services
builder.Services.AddScoped<IReportService, ReportService>();

// Register Follow Repository
builder.Services.AddScoped<IFollowRepository, FollowRepository>();

// Register Review Repository and Service
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IReviewService, ReviewService>();

// Register Notification Repository and Service
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// Register Push Notification Repository and Service
builder.Services.AddScoped<IPushSubscriptionRepository, PushSubscriptionRepository>();
builder.Services.AddScoped<IPushNotificationService, PushNotificationService>();

// Register Email Service
builder.Services.AddScoped<IEmailService, SmtpEmailService>();

// Register Gemini AI Service
builder.Services.AddHttpClient<IGeminiService, GeminiService>();

// Register background service for appointment reminders
builder.Services.AddHostedService<AppointmentReminderService>();

// Add authorization services
builder.Services.AddAuthorization();

builder.Services.AddControllers();

// Add authentication middleware
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer("Bearer", options =>
    {
        var jwtConfig = builder.Configuration.GetSection("Jwt");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtConfig["Issuer"],
            ValidAudience = jwtConfig["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtConfig["Key"] ?? throw new InvalidOperationException("JWT Key is not configured.")))
        };
        // read JWT from cookie instead of Authorization header
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue("access_token", out var token))
                {
                    context.Token = token;
                }
                return Task.CompletedTask;
            }
        };
    });

var app = builder.Build();

// Seed admin user on startup (idempotent — skipped if admin already exists)
// Wrapped in try/catch so a slow DB wake-up (serverless auto-pause) doesn't crash the app.
// The seed will be retried on the next restart if it fails here.
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    if (!db.Users.Any(u => u.Role == WebAPI.Models.UserRole.admin))
    {
        var adminPassword = app.Configuration["Admin:SeedPassword"]
            ?? throw new InvalidOperationException("Admin:SeedPassword is not configured.");

        var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<WebAPI.Models.User>();
        var admin = new WebAPI.Models.User
        {
            Id = Guid.NewGuid(),
            Name = "Admin",
            Email = "admin@appointly.com",
            Role = WebAPI.Models.UserRole.admin,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        admin.Password = passwordHasher.HashPassword(admin, adminPassword);
        db.Users.Add(admin);
        db.SaveChanges();
    }
}
catch (Exception ex)
{
    // Log and continue — app starts without admin seed rather than crashing entirely.
    // This happens when the serverless DB is waking up from auto-pause on first deploy.
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogWarning(ex, "Admin seed skipped — DB may still be waking up. Will retry on next restart.");
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Title = "Appointly API";
        options.Theme = ScalarTheme.Kepler;
    });
}


app.UseHttpsRedirection();
app.UseStaticFiles();

// Security response headers
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    await next();
});

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.UseCors("Frontend");
app.MapControllers();

app.Run();

