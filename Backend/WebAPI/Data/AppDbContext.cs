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
        public DbSet<AppointmentSlot> AppointmentSlots => Set<AppointmentSlot>();

        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }


    }
}