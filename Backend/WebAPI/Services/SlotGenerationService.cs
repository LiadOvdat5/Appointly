using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Services
{
    public class SlotGenerationService
    {
        private readonly IServiceScheduleRepository _serviceScheduleRepository;
        private readonly IWeeklyWorkingRuleRepository _weeklyWorkingRuleRepository;
        private readonly IBreakRuleRepository _breakRuleRepository;
        private readonly IRecurringRuleRepository _recurringRuleRepository;
        private readonly IDateExceptionRepository _dateExceptionRepository;
        private readonly IServiceRepository _serviceRepository;
        private readonly ILogger<SlotGenerationService> _logger;

        public SlotGenerationService(
            IServiceScheduleRepository serviceScheduleRepository,
            IWeeklyWorkingRuleRepository weeklyWorkingRuleRepository,
            IBreakRuleRepository breakRuleRepository,
            IRecurringRuleRepository recurringRuleRepository,
            IDateExceptionRepository dateExceptionRepository,
            IServiceRepository serviceRepository,
            ILogger<SlotGenerationService> logger)
        {
            _serviceScheduleRepository = serviceScheduleRepository;
            _weeklyWorkingRuleRepository = weeklyWorkingRuleRepository;
            _breakRuleRepository = breakRuleRepository;
            _recurringRuleRepository = recurringRuleRepository;
            _dateExceptionRepository = dateExceptionRepository;
            _serviceRepository = serviceRepository;
            _logger = logger;
        }

        /// <summary>
        /// Generate available slots for a service based on its availability rules
        /// Service configuration (timezone, advance booking days) comes from the business
        /// </summary>
        public async Task GenerateAvailableSlotsAsync(Guid serviceId, CancellationToken ct = default)
        {
            try
            {
                var service = await _serviceRepository.GetByIdAsync(serviceId);
                if (service == null)
                {
                    _logger.LogWarning($"Service not found: {serviceId}");
                    return;
                }

                if (service.Business == null)
                {
                    _logger.LogWarning($"Business not found for service: {serviceId}");
                    return;
                }

                // Use business settings for slot generation
                var advanceBookingDays = service.Business.AdvanceBookingDays > 0 ? service.Business.AdvanceBookingDays : 90;
                var timezoneId = !string.IsNullOrEmpty(service.Business.Timezone) ? service.Business.Timezone : "UTC";
                var tz = LoadTimeZone(timezoneId);

                // Calculate generation range in the business's local timezone
                var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, tz);
                var startDate = nowLocal.Date.AddDays(1);
                var endDate = nowLocal.Date.AddDays(advanceBookingDays);

                _logger.LogInformation($"Generating slots for service {serviceId} from {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd} " +
                    $"(duration: {service.Duration}min, timezone: {timezoneId})");

                int slotsCreated = 0;
                for (var date = startDate; date <= endDate; date = date.AddDays(1))
                {
                    if (ct.IsCancellationRequested)
                        break;

                    // Get working hours for this date (priority-based resolution)
                    var workingIntervals = await GetWorkingHoursForDateAsync(serviceId, date);

                    if (workingIntervals == null || workingIntervals.Length == 0)
                    {
                        _logger.LogDebug($"No working hours for {date:yyyy-MM-dd}");
                        continue;
                    }

                    // Subtract breaks
                    workingIntervals = await SubtractBreaksAsync(serviceId, workingIntervals, date);

                    if (workingIntervals == null || workingIntervals.Length == 0)
                    {
                        _logger.LogDebug($"No working hours after breaks for {date:yyyy-MM-dd}");
                        continue;
                    }

                    // Split intervals into slots
                    var slots = GenerateSlotsFromIntervals(date, workingIntervals, service.Duration, tz);

                    // Insert slots
                    foreach (var (startDateTime, endDateTime) in slots)
                    {
                        var inserted = await _serviceScheduleRepository.InsertIfNotExistsAsync(
                            serviceId, startDateTime, endDateTime);
                        if (inserted) slotsCreated++;
                    }
                }

                _logger.LogInformation($"Generated {slotsCreated} new slots for service {serviceId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating slots for service {serviceId}");
                throw;
            }
        }

        /// <summary>
        /// Generate available slots for a service within a specific date range
        /// Respects all availability rules (DateException > RecurringRule > WeeklyWorkingRule)
        /// </summary>
        public async Task<int> GenerateSlotsForDateRangeAsync(Guid serviceId, DateTime startDate, DateTime endDate, CancellationToken ct = default)
        {
            try
            {
                var service = await _serviceRepository.GetByIdAsync(serviceId);
                if (service == null)
                {
                    _logger.LogWarning($"Service not found: {serviceId}");
                    return 0;
                }

                if (service.Business == null)
                {
                    _logger.LogWarning($"Business not found for service: {serviceId}");
                    return 0;
                }

                var timezoneId = !string.IsNullOrEmpty(service.Business.Timezone) ? service.Business.Timezone : "UTC";
                var tz = LoadTimeZone(timezoneId);

                _logger.LogInformation($"Generating slots for service {serviceId} from {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd} " +
                    $"(duration: {service.Duration}min, timezone: {timezoneId})");

                int slotsCreated = 0;
                for (var date = startDate; date <= endDate; date = date.AddDays(1))
                {
                    if (ct.IsCancellationRequested)
                        break;

                    // Get working hours for this date (priority-based resolution)
                    var workingIntervals = await GetWorkingHoursForDateAsync(serviceId, date);

                    if (workingIntervals == null || workingIntervals.Length == 0)
                    {
                        _logger.LogDebug($"No working hours for {date:yyyy-MM-dd}");
                        continue;
                    }

                    // Subtract breaks
                    workingIntervals = await SubtractBreaksAsync(serviceId, workingIntervals, date);

                    if (workingIntervals == null || workingIntervals.Length == 0)
                    {
                        _logger.LogDebug($"No working hours after breaks for {date:yyyy-MM-dd}");
                        continue;
                    }

                    // Split intervals into slots
                    var slots = GenerateSlotsFromIntervals(date, workingIntervals, service.Duration, tz);

                    // Insert slots
                    foreach (var (startDateTime, endDateTime) in slots)
                    {
                        var inserted = await _serviceScheduleRepository.InsertIfNotExistsAsync(
                            serviceId, startDateTime, endDateTime);
                        if (inserted) slotsCreated++;
                    }
                }

                _logger.LogInformation($"Generated {slotsCreated} new slots for service {serviceId} from {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}");
                return slotsCreated;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating slots for service {serviceId} in date range {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}");
                throw;
            }
        }

        /// <summary>
        /// Resolve working hours for a specific date using priority resolution
        /// Priority: DateException > RecurringRule > WeeklyWorkingRule
        /// </summary>
        private async Task<TimeSpan[]?> GetWorkingHoursForDateAsync(Guid serviceId, DateTime date)
        {
            // 1. Check DateException (Highest priority)
            var exception = await _dateExceptionRepository.GetByDateAsync(serviceId, date);
            if (exception != null)
            {
                if (!exception.IsWorkingDay)
                    return null; // Not a working day

                if (exception.StartTime.HasValue && exception.EndTime.HasValue)
                    return new[] { exception.StartTime.Value, exception.EndTime.Value };

                return null;
            }

            // 2. Check RecurringRule (Medium priority)
            var dayOfWeek = (int)date.DayOfWeek == 0 ? 6 : (int)date.DayOfWeek - 1; // Convert to Monday=0
            var recurringRules = await _recurringRuleRepository.GetByServiceIdAsync(serviceId);

            foreach (var rule in recurringRules)
            {
                if (date.Date < rule.StartDate.Date || date.Date > rule.EndDate.Date)
                    continue;

                var ruleDaysOfWeek = JsonSerializer.Deserialize<int[]>(rule.DaysOfWeek);
                if (ruleDaysOfWeek != null && ruleDaysOfWeek.Contains(dayOfWeek))
                {
                    return new[] { rule.StartTime, rule.EndTime };
                }
            }

            // 3. Check WeeklyWorkingRule (Lowest priority)
            var weeklyRules = await _weeklyWorkingRuleRepository.GetByServiceIdAsync(serviceId);
            var weeklyRule = weeklyRules.FirstOrDefault(w => w.DayOfWeek == dayOfWeek);

            if (weeklyRule != null)
            {
                if (!weeklyRule.IsWorkingDay)
                    return null;

                return new[] { weeklyRule.StartTime, weeklyRule.EndTime };
            }

            return null; // No working hours defined
        }

        /// <summary>
        /// Subtract break rules from working intervals
        /// </summary>
        private async Task<TimeSpan[]?> SubtractBreaksAsync(Guid serviceId, TimeSpan[] intervals, DateTime date)
        {
            var breakRules = await _breakRuleRepository.GetByServiceIdAsync(serviceId);
            var dayOfWeek = (int)date.DayOfWeek == 0 ? 6 : (int)date.DayOfWeek - 1;

            var resultIntervals = new List<(TimeSpan start, TimeSpan end)>();

            // Convert flat array to tuples
            for (int i = 0; i < intervals.Length; i += 2)
            {
                if (i + 1 >= intervals.Length) break;

                var start = intervals[i];
                var end = intervals[i + 1];
                var currentIntervals = new List<(TimeSpan start, TimeSpan end)> { (start, end) };

                // Apply applicable breaks
                foreach (var breakRule in breakRules)
                {
                    // Check if break applies to this date
                    if (breakRule.StartDate.HasValue && date < breakRule.StartDate)
                        continue;
                    if (breakRule.EndDate.HasValue && date > breakRule.EndDate)
                        continue;

                    // Check if break applies to this day
                    if (breakRule.DayOfWeek.HasValue && breakRule.DayOfWeek != dayOfWeek)
                        continue;

                    // Subtract break from intervals
                    var newIntervals = new List<(TimeSpan start, TimeSpan end)>();
                    foreach (var (iStart, iEnd) in currentIntervals)
                    {
                        // Break time
                        var bStart = breakRule.StartTime;
                        var bEnd = breakRule.EndTime;

                        // No overlap
                        if (iEnd <= bStart || iStart >= bEnd)
                        {
                            newIntervals.Add((iStart, iEnd));
                        }
                        else
                        {
                            // Add parts before break
                            if (iStart < bStart)
                                newIntervals.Add((iStart, bStart));

                            // Add parts after break
                            if (iEnd > bEnd)
                                newIntervals.Add((bEnd, iEnd));
                        }
                    }
                    currentIntervals = newIntervals;
                }

                resultIntervals.AddRange(currentIntervals);
            }

            if (resultIntervals.Count == 0)
                return null;

            return resultIntervals.SelectMany(i => new[] { i.start, i.end }).ToArray();
        }

        /// <summary>
        /// Split time intervals into service duration slots, storing times as UTC.
        /// </summary>
        private List<(DateTime start, DateTime end)> GenerateSlotsFromIntervals(
            DateTime date, TimeSpan[] intervals, int durationMinutes, TimeZoneInfo tz)
        {
            var slots = new List<(DateTime start, DateTime end)>();
            var slotDuration = TimeSpan.FromMinutes(durationMinutes);

            for (int i = 0; i < intervals.Length; i += 2)
            {
                if (i + 1 >= intervals.Length) break;

                var startTime = intervals[i];
                var endTime = intervals[i + 1];

                var current = date.Add(startTime);
                var end = date.Add(endTime);

                while (current.Add(slotDuration) <= end)
                {
                    var utcStart = TimeZoneInfo.ConvertTimeToUtc(
                        DateTime.SpecifyKind(current, DateTimeKind.Unspecified), tz);
                    var utcEnd = TimeZoneInfo.ConvertTimeToUtc(
                        DateTime.SpecifyKind(current.Add(slotDuration), DateTimeKind.Unspecified), tz);
                    slots.Add((utcStart, utcEnd));
                    current = current.Add(slotDuration);
                }
            }

            return slots;
        }

        private static TimeZoneInfo LoadTimeZone(string timezoneId)
        {
            try { return TimeZoneInfo.FindSystemTimeZoneById(timezoneId); }
            catch { return TimeZoneInfo.Utc; }
        }
    }
}
