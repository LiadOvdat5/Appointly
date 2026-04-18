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
        /// <summary>
        /// Delete AVAILABLE slots in a date/time window. All filters are optional.
        /// dayOfWeek (0=Mon–6=Sun): if provided, only slots on that weekday are deleted.
        /// startTime/endTime ("HH:mm"): if provided, only slots whose start falls within [startTime, endTime) are deleted.
        /// Returns the count of deleted slots.
        /// </summary>
        Task<int> DeleteAvailableSlotsInWindowAsync(
            Guid serviceId,
            DateTime fromDate,
            DateTime toDate,
            int? dayOfWeek = null,
            string? startTime = null,
            string? endTime = null);

        /// <summary>Set a slot's status to BLOCKED with an optional note. Returns the updated slot, or null if not found.</summary>
        Task<ServiceSchedule?> BlockSlotAsync(Guid slotId, string? blockNote = null);

        /// <summary>Set a BLOCKED slot's status back to AVAILABLE and clear BlockNote. Returns the updated slot, or null if not found.</summary>
        Task<ServiceSchedule?> UnblockSlotAsync(Guid slotId);

        /// <summary>Delete ALL slots for a service regardless of status. Returns the count deleted.</summary>
        Task<int> ClearAllSlotsAsync(Guid serviceId);
    }
}
