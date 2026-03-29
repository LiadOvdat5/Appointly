namespace WebAPI.DTOs
{
    public class StaffReportDTO
    {
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int TotalAppointments { get; set; }
        public int CurrentMonthAppointments { get; set; }
        public decimal Revenue { get; set; }
        public decimal CompletionRate { get; set; }
        // Placeholder until Reviews epic
        public double? AverageRating { get; set; }
    }
}
