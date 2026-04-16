namespace WebAPI.DTOs
{
    public class AssignedStaffDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsOwner { get; set; }
    }

    public class ServiceDTO
    {
        public Guid Id { get; set; }
        public Guid BusinessId { get; set; }
        public Guid UserId { get; set; }
        public Guid CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Duration { get; set; }
        public decimal? Price { get; set; }
        public bool BlockOnBooking { get; set; }
        public AssignedStaffDTO? AssignedStaff { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}