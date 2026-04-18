namespace WebAPI.DTOs
{
    public class CustomerReportDTO
    {
        public Guid CustomerId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int TotalBookings { get; set; }
        public int CompletedBookings { get; set; }
        public int CanceledBookings { get; set; }
        public decimal TotalSpent { get; set; }
        // Amounts grouped by the business currency they were charged in
        public Dictionary<string, decimal> TotalSpentByCurrency { get; set; } = new();
        public string? FavoriteBusinessName { get; set; }
        public int FavoriteBusinessCount { get; set; }
        public string? FavoriteServiceName { get; set; }
        public int FavoriteServiceCount { get; set; }
    }
}
