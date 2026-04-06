namespace WebAPI.DTOs
{
    public class AdminUserDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsSuspended { get; set; }
        public string? SuspendedReason { get; set; }
    }

    public class SuspendUserDTO
    {
        public string? Reason { get; set; }
    }

    public class AdminUsersPageDTO
    {
        public List<AdminUserDTO> Users { get; set; } = [];
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}
