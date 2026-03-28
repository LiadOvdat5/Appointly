namespace WebAPI.DTOs
{
    public class BusinessReportDTO
    {
        public Guid BusinessId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public int TotalAppointments { get; set; }
        public decimal Revenue { get; set; }

        public string? TopServiceName { get; set; }
        public int TopServiceCount { get; set; }

        public int Cancellations { get; set; }
        public int UniqueCustomers { get; set; }
        public string? BusiestDayOfWeek { get; set; }
    }
}
