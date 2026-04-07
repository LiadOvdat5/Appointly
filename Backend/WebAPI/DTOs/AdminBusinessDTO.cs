namespace WebAPI.DTOs
{
    public class AdminBusinessDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string OwnerName { get; set; } = string.Empty;
        public string OwnerEmail { get; set; } = string.Empty;
        public List<string> Categories { get; set; } = [];
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
        public bool IsSuspended { get; set; }
        public string? SuspendedReason { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AdminBusinessesPageDTO
    {
        public List<AdminBusinessDTO> Businesses { get; set; } = [];
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class SuspendBusinessDTO
    {
        public string? Reason { get; set; }
    }
}
