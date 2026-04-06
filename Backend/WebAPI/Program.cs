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
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // For using cookies auth
    });

});



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
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (!db.Users.Any(u => u.Role == WebAPI.Models.UserRole.admin))
    {
        var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<WebAPI.Models.User>();
        var admin = new WebAPI.Models.User
        {
            Id = Guid.NewGuid(),
            Name = "Admin",
            Email = "admin@bizslot.com",
            Role = WebAPI.Models.UserRole.admin,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        admin.Password = passwordHasher.HashPassword(admin, "Admin@BizSlot1!");
        db.Users.Add(admin);
        db.SaveChanges();
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Title = "BizSlot API";
        options.Theme = ScalarTheme.Kepler;
    });
}


app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.UseCors("Frontend");
app.MapControllers();

app.Run();

