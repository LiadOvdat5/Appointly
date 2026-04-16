namespace WebAPI.DTOs
{
    public class StaffMemberDTO
    {
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime JoinedAt { get; set; }
        public List<string> AssignedServiceNames { get; set; } = new();
        public int AssignedServicesCount => AssignedServiceNames.Count;
        public bool IsOwner { get; set; }
    }
}
