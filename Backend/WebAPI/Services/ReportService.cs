using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Models;
using WebAPI.Utilities;

namespace WebAPI.Services
{
    public class ReportService : IReportService
    {
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IBusinessRepository _businessRepository;

        public ReportService(
            IAppointmentRepository appointmentRepository,
            IBusinessRepository businessRepository)
        {
            _appointmentRepository = appointmentRepository;
            _businessRepository = businessRepository;
        }

        public async Task<BusinessReportDTO> GetBusinessReportAsync(
            Guid businessId,
            Guid requestingUserId,
            DateTime startDate,
            DateTime endDate)
        {
            var business = await _businessRepository.GetBusinessEntityByIdAsync(businessId);
            if (business == null)
                throw new InvalidOperationException($"Business '{businessId}' not found.");

            if (business.OwnerId != requestingUserId)
                throw new UnauthorizedAccessException("Only the business owner can view reports.");

            var appointments = await _appointmentRepository.GetByDateRangeAsync(businessId, startDate, endDate);

            // Only count non-canceled appointments
            var completed = appointments
                .Where(a => a.Status != AppointmentStatus.canceled)
                .ToList();

            var totalAppointments = completed.Count;

            var revenue = completed
                .Where(a => a.Service?.Price != null)
                .Sum(a => a.Service!.Price!.Value);

            // Top service by booking count
            var topService = completed
                .Where(a => a.Service != null)
                .GroupBy(a => new { a.ServiceId, a.Service!.Name })
                .OrderByDescending(g => g.Count())
                .FirstOrDefault();

            var cancellations = appointments.Count(a => a.Status == AppointmentStatus.canceled);

            var uniqueCustomers = completed.Select(a => a.ClientId).Distinct().Count();

            // Busiest day of week (by appointment count, non-canceled)
            var busiestDay = completed
                .GroupBy(a => a.StartDateTime.DayOfWeek)
                .OrderByDescending(g => g.Count())
                .FirstOrDefault();
            var busiestDayName = busiestDay?.Key.ToString(); // "Monday", "Tuesday", etc.

            return new BusinessReportDTO
            {
                BusinessId = businessId,
                StartDate = startDate,
                EndDate = endDate,
                TotalAppointments = totalAppointments,
                Revenue = revenue,
                TopServiceName = topService?.Key.Name,
                TopServiceCount = topService?.Count() ?? 0,
                Cancellations = cancellations,
                UniqueCustomers = uniqueCustomers,
                BusiestDayOfWeek = busiestDayName,
            };
        }
    }
}
