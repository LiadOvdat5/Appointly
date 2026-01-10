using Scalar.AspNetCore;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.Interfaces;
using WebAPI.Repositories;
using WebAPI.Services;
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
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));



// Register AuthRepository and JwtService
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBusinessRepository, BusinessRepository>();
builder.Services.AddScoped<IBusinessInvitationRepository, BusinessInvitationRepository>();
builder.Services.AddScoped<IServiceRepository, ServiceRepository>();

// Register Schedule & Availability Repositories
builder.Services.AddScoped<IWeeklyWorkingRuleRepository, WeeklyWorkingRuleRepository>();
builder.Services.AddScoped<IBreakRuleRepository, BreakRuleRepository>();
builder.Services.AddScoped<IRecurringRuleRepository, RecurringRuleRepository>();
builder.Services.AddScoped<IDateExceptionRepository, DateExceptionRepository>();
builder.Services.AddScoped<IServiceScheduleRepository, ServiceScheduleRepository>();

// Register Schedule & Availability Services
builder.Services.AddScoped<SlotGenerationService>();
// builder.Services.AddScoped<AvailabilityRulesService>(); // Disabled during refactor

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
    });

var app = builder.Build();

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
app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

app.Run();

