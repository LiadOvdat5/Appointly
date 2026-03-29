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
        public string? FavoriteBusinessName { get; set; }
        public int FavoriteBusinessCount { get; set; }
        public string? FavoriteServiceName { get; set; }
        public int FavoriteServiceCount { get; set; }
    }
}
