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
    }
}
