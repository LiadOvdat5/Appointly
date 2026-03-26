using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Repositories
{
    public class ServiceScheduleRepository : IServiceScheduleRepository
    {
        private readonly AppDbContext _context;

        public ServiceScheduleRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ServiceSchedule?> GetByIdAsync(Guid id)
        {
            return await _context.ServiceSchedules
                .Include(ss => ss.Service)
                .FirstOrDefaultAsync(ss => ss.Id == id);
        }

        public async Task<List<ServiceSchedule>> GetByServiceIdAsync(Guid serviceId)
        {
            return await _context.ServiceSchedules
                .Where(ss => ss.ServiceId == serviceId)
                .OrderBy(ss => ss.StartDateTime)
                .ToListAsync();
        }

        public async Task<List<ServiceSchedule>> GetAvailableSlotsAsync(Guid serviceId, DateTime from, DateTime to)
        {
            return await _context.ServiceSchedules
                .Where(ss => ss.ServiceId == serviceId
                    && ss.Status == ScheduleStatus.AVAILABLE
                    && ss.StartDateTime >= from
                    && ss.EndDateTime <= to)
                .OrderBy(ss => ss.StartDateTime)
                .ToListAsync();
        }

        public async Task<ServiceSchedule?> GetSlotAsync(Guid serviceId, DateTime startDateTime, DateTime endDateTime)
        {
            return await _context.ServiceSchedules
                .FirstOrDefaultAsync(ss => ss.ServiceId == serviceId
                    && ss.StartDateTime == startDateTime
                    && ss.EndDateTime == endDateTime);
        }

        public async Task<ServiceSchedule> CreateAsync(ServiceSchedule schedule)
        {
            schedule.Id = Guid.NewGuid();
            schedule.CreatedAt = DateTime.UtcNow;
            schedule.UpdatedAt = DateTime.UtcNow;

            _context.ServiceSchedules.Add(schedule);
            await _context.SaveChangesAsync();
            return schedule;
        }

        public async Task<ServiceSchedule> UpdateAsync(ServiceSchedule schedule)
        {
            schedule.UpdatedAt = DateTime.UtcNow;
            _context.ServiceSchedules.Update(schedule);
            await _context.SaveChangesAsync();
            return schedule;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var schedule = await _context.ServiceSchedules.FindAsync(id);
            if (schedule == null)
                return false;

            _context.ServiceSchedules.Remove(schedule);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> BlockAvailableSlotsForDateAsync(Guid serviceId, DateTime date)
        {
            var dayStart = date.Date;
            var dayEnd = dayStart.AddDays(1);

            var slots = await _context.ServiceSchedules
                .Where(ss => ss.ServiceId == serviceId
                    && ss.Status == ScheduleStatus.AVAILABLE
                    && ss.StartDateTime >= dayStart
                    && ss.StartDateTime < dayEnd)
                .ToListAsync();

            foreach (var slot in slots)
            {
                slot.Status = ScheduleStatus.BLOCKED;
                slot.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return slots.Count;
        }

        public async Task<int> UnblockSlotsForDateAsync(Guid serviceId, DateTime date)
        {
            var dayStart = date.Date;
            var dayEnd = dayStart.AddDays(1);

            var slots = await _context.ServiceSchedules
                .Where(ss => ss.ServiceId == serviceId
                    && ss.Status == ScheduleStatus.BLOCKED
                    && ss.StartDateTime >= dayStart
                    && ss.StartDateTime < dayEnd)
                .ToListAsync();

            foreach (var slot in slots)
            {
                slot.Status = ScheduleStatus.AVAILABLE;
                slot.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return slots.Count;
        }

        public async Task<bool> InsertIfNotExistsAsync(Guid serviceId, DateTime startDateTime, DateTime endDateTime)
        {
            // Check if slot already exists
            var exists = await _context.ServiceSchedules
                .AnyAsync(ss => ss.ServiceId == serviceId
                    && ss.StartDateTime == startDateTime
                    && ss.EndDateTime == endDateTime);

            if (exists)
                return false; // Slot already exists, no insertion

            // Create new slot
            var schedule = new ServiceSchedule
            {
                Id = Guid.NewGuid(),
                ServiceId = serviceId,
                StartDateTime = startDateTime,
                EndDateTime = endDateTime,
                Status = ScheduleStatus.AVAILABLE,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ServiceSchedules.Add(schedule);
            await _context.SaveChangesAsync();
            return true; // Successfully inserted
        }
    }
}
