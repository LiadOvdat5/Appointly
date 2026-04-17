using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebAPI.Models;

namespace WebAPI.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<BusinessPartner> BusinessPartners => Set<BusinessPartner>();
        public DbSet<Business> Businesses => Set<Business>();
        public DbSet<BusinessInvitation> BusinessInvitations => Set<BusinessInvitation>();
        public DbSet<Service> Services => Set<Service>();
        public DbSet<AvailabilityRule> AvailabilityRules => Set<AvailabilityRule>();
        public DbSet<AvailabilitySlot> AvailabilitySlots => Set<AvailabilitySlot>();
        public DbSet<Appointment> Appointments => Set<Appointment>();

        // Schedule & Availability Models
        public DbSet<WeeklyWorkingRule> WeeklyWorkingRules => Set<WeeklyWorkingRule>();
        public DbSet<BreakRule> BreakRules => Set<BreakRule>();
        public DbSet<RecurringRule> RecurringRules => Set<RecurringRule>();
        public DbSet<DateException> DateExceptions => Set<DateException>();
        public DbSet<ServiceSchedule> ServiceSchedules => Set<ServiceSchedule>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Follow> Follows => Set<Follow>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<Notification> Notifications => Set<Notification>();
        public DbSet<PushSubscription> PushSubscriptions => Set<PushSubscription>();
        public DbSet<CategoryRequest> CategoryRequests => Set<CategoryRequest>();

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure BusinessPartner composite key
            modelBuilder.Entity<BusinessPartner>()
                .HasKey(bp => new { bp.UserId, bp.BusinessId });

            // Unique slug per business
            modelBuilder.Entity<Business>()
                .HasIndex(b => b.Slug)
                .IsUnique();

            // Unique GoogleId per user (sparse — only applies to non-null values)
            modelBuilder.Entity<User>()
                .HasIndex(u => u.GoogleId)
                .IsUnique()
                .HasFilter("[GoogleId] IS NOT NULL");

            // =====================================================
            // Follow Relationships
            // =====================================================

            modelBuilder.Entity<Follow>()
                .HasOne(f => f.User)
                .WithMany()
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Follow>()
                .HasOne(f => f.Business)
                .WithMany()
                .HasForeignKey(f => f.BusinessId)
                .OnDelete(DeleteBehavior.Cascade);

            // Prevent a user from following the same business twice
            modelBuilder.Entity<Follow>()
                .HasIndex(f => new { f.UserId, f.BusinessId })
                .IsUnique();

            // =====================================================
            // Schedule & Availability Relationships
            // =====================================================

            // WeeklyWorkingRule Configuration
            modelBuilder.Entity<WeeklyWorkingRule>()
                .HasOne(wwr => wwr.Service)
                .WithMany()
                .HasForeignKey(wwr => wwr.ServiceId)
                .OnDelete(DeleteBehavior.Cascade);

            // BreakRule Configuration
            modelBuilder.Entity<BreakRule>()
                .HasOne(br => br.Service)
                .WithMany()
                .HasForeignKey(br => br.ServiceId)
                .OnDelete(DeleteBehavior.Cascade);

            // RecurringRule Configuration
            modelBuilder.Entity<RecurringRule>()
                .HasOne(rr => rr.Service)
                .WithMany()
                .HasForeignKey(rr => rr.ServiceId)
                .OnDelete(DeleteBehavior.Cascade);

            // DateException Configuration
            modelBuilder.Entity<DateException>()
                .HasOne(de => de.Service)
                .WithMany()
                .HasForeignKey(de => de.ServiceId)
                .OnDelete(DeleteBehavior.Cascade);

            // ServiceSchedule Configuration
            modelBuilder.Entity<ServiceSchedule>()
                .HasOne(ss => ss.Service)
                .WithMany(s => s.ServiceSchedules)
                .HasForeignKey(ss => ss.ServiceId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint: Prevent duplicate slots
            modelBuilder.Entity<ServiceSchedule>()
                .HasIndex(ss => new { ss.ServiceId, ss.StartDateTime })
                .IsUnique();



            // =====================================================
            // Review Relationships
            // =====================================================

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Business)
                .WithMany()
                .HasForeignKey(r => r.BusinessId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Customer)
                .WithMany()
                .HasForeignKey(r => r.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Appointment)
                .WithMany()
                .HasForeignKey(r => r.AppointmentId)
                .OnDelete(DeleteBehavior.Restrict);

            // One review per business per customer
            modelBuilder.Entity<Review>()
                .HasIndex(r => new { r.CustomerId, r.BusinessId })
                .IsUnique();

            // =====================================================
            // CategoryRequest Relationships
            // =====================================================

            modelBuilder.Entity<CategoryRequest>()
                .HasOne(cr => cr.RequestedBy)
                .WithMany()
                .HasForeignKey(cr => cr.RequestedByUserId)
                .OnDelete(DeleteBehavior.Cascade);

            // =====================================================
            // Notification Relationships
            // =====================================================

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Notification>()
                .HasIndex(n => new { n.UserId, n.CreatedAt });
            modelBuilder.Entity<Notification>()
                .HasIndex(n => new { n.UserId, n.IsRead });

            // =====================================================
            // PushSubscription Relationships
            // =====================================================

            modelBuilder.Entity<PushSubscription>()
                .HasOne(ps => ps.User)
                .WithMany()
                .HasForeignKey(ps => ps.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // One subscription row per browser endpoint (globally unique)
            modelBuilder.Entity<PushSubscription>()
                .HasIndex(ps => ps.Endpoint)
                .IsUnique();

            // =====================================================
            // Appointment Relationships
            // =====================================================

            // Appointment → Service
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Service)
                .WithMany()
                .HasForeignKey(a => a.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Service → Category (service owns category assignment)
            modelBuilder.Entity<Service>()
                .HasOne(s => s.Category)
                .WithMany()
                .HasForeignKey(s => s.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Category name unique index
            modelBuilder.Entity<Category>()
                .HasIndex(c => c.Name)
                .IsUnique();

            // Seed initial categories (including an 'Uncategorized' used as a safe default for existing services)
            modelBuilder.Entity<Category>().HasData(
                new Category { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Name = "Uncategorized" },
                new Category { Id = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e01"), Name = "Men's Haircut" },
                new Category { Id = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e02"), Name = "Women's Haircut" },
                new Category { Id = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e03"), Name = "Beard Trim" },
                new Category { Id = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e04"), Name = "Hair Coloring" },
                new Category { Id = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e05"), Name = "Nail Polish" },
                new Category { Id = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e06"), Name = "Gel Nails" },
                new Category { Id = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e07"), Name = "Manicure" },
                new Category { Id = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e08"), Name = "Pedicure" },
                new Category { Id = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e09"), Name = "Eyebrow Shaping" },
                new Category { Id = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e10"), Name = "Facial Treatment" }
            );

            // Appointment → Client (User)
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Client)
                .WithMany()
                .HasForeignKey(a => a.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            // Appointment → Partner (User)
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Partner)
                .WithMany()
                .HasForeignKey(a => a.PartnerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Appointment → Business
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Business)
                .WithMany()
                .HasForeignKey(a => a.BusinessId)
                .OnDelete(DeleteBehavior.Restrict);

            // Appointment → ServiceSchedule (One-to-Many)
            // Changed from one-to-one to allow multiple appointments per schedule (history tracking)
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.ServiceSchedule)
                .WithMany(ss => ss.Appointments)
                .HasForeignKey(a => a.ServiceScheduleId)
                .OnDelete(DeleteBehavior.Restrict);

            // Service → AssignedStaff (User) — nullable 1-to-1 from service's side
            // NoAction: SQL Server disallows SET NULL when there are multiple cascade paths via Users
            modelBuilder.Entity<Service>()
                .HasOne(s => s.AssignedStaff)
                .WithMany()
                .HasForeignKey(s => s.AssignedStaffId)
                .OnDelete(DeleteBehavior.NoAction)
                .IsRequired(false);

            // ServiceSchedule → blocking appointment (conflict FK, nullable)
            modelBuilder.Entity<ServiceSchedule>()
                .HasOne<Appointment>()
                .WithMany()
                .HasForeignKey(ss => ss.BlockingAppointmentId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);
        }
    }
}