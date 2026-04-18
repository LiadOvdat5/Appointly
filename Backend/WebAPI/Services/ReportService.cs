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

        public async Task<CustomerReportDTO> GetCustomerReportAsync(
            Guid customerId,
            DateTime startDate,
            DateTime endDate)
        {
            var appointments = await _appointmentRepository.GetByClientIdAndDateRangeAsync(customerId, startDate, endDate);

            var canceled = appointments.Count(a => a.Status == AppointmentStatus.canceled);
            var nonCanceled = appointments.Where(a => a.Status != AppointmentStatus.canceled).ToList();

            var totalSpent = nonCanceled
                .Where(a => a.Service?.Price != null)
                .Sum(a => a.Service!.Price!.Value);

            var totalSpentByCurrency = nonCanceled
                .Where(a => a.Service?.Price != null && a.Business != null)
                .GroupBy(a => a.Business!.Currency)
                .ToDictionary(
                    g => g.Key,
                    g => g.Sum(a => a.Service!.Price!.Value));

            var favBusiness = nonCanceled
                .Where(a => a.Business != null)
                .GroupBy(a => new { a.BusinessId, a.Business!.Name })
                .OrderByDescending(g => g.Count())
                .FirstOrDefault();

            var favService = nonCanceled
                .Where(a => a.Service != null)
                .GroupBy(a => new { a.ServiceId, a.Service!.Name })
                .OrderByDescending(g => g.Count())
                .FirstOrDefault();

            return new CustomerReportDTO
            {
                CustomerId = customerId,
                StartDate = startDate,
                EndDate = endDate,
                TotalBookings = nonCanceled.Count,
                CompletedBookings = nonCanceled.Count(a => a.Status == AppointmentStatus.completed),
                CanceledBookings = canceled,
                TotalSpent = totalSpent,
                TotalSpentByCurrency = totalSpentByCurrency,
                FavoriteBusinessName = favBusiness?.Key.Name,
                FavoriteBusinessCount = favBusiness?.Count() ?? 0,
                FavoriteServiceName = favService?.Key.Name,
                FavoriteServiceCount = favService?.Count() ?? 0,
            };
        }
    }
}
