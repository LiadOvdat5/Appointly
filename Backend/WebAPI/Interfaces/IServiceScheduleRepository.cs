using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface IServiceScheduleRepository
    {
        Task<ServiceSchedule?> GetByIdAsync(Guid id);
        Task<List<ServiceSchedule>> GetByServiceIdAsync(Guid serviceId);
        Task<List<ServiceSchedule>> GetAvailableSlotsAsync(Guid serviceId, DateTime from, DateTime to);
        Task<ServiceSchedule?> GetSlotAsync(Guid serviceId, DateTime startDateTime, DateTime endDateTime);
        Task<ServiceSchedule> CreateAsync(ServiceSchedule schedule);
        Task<ServiceSchedule> UpdateAsync(ServiceSchedule schedule);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> InsertIfNotExistsAsync(Guid serviceId, DateTime startDateTime, DateTime endDateTime);
        /// <summary>Block all AVAILABLE slots on a specific date. Returns the count blocked.</summary>
        Task<int> BlockAvailableSlotsForDateAsync(Guid serviceId, DateTime date);
        /// <summary>Restore all BLOCKED slots on a specific date back to AVAILABLE. Returns the count restored.</summary>
        Task<int> UnblockSlotsForDateAsync(Guid serviceId, DateTime date);
    }
}
