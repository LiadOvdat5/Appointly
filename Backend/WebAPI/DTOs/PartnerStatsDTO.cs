namespace WebAPI.DTOs
{
    public class PartnerNextAppointmentDTO
    {
        public Guid AppointmentId { get; set; }
        public DateTime StartDateTime { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
    }

    public class PartnerAssignedServiceDTO
    {
        public Guid ServiceId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public decimal? Price { get; set; }
    }

    public class PartnerWorkplaceDTO
    {
        public Guid BusinessId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
        public string? Slug { get; set; }
    }

    public class PartnerStatsDTO
    {
        public PartnerNextAppointmentDTO? NextAppointment { get; set; }
        public int TodayCount { get; set; }
        public int WeekCount { get; set; }
        public IEnumerable<PartnerAssignedServiceDTO> AssignedServices { get; set; } = [];
        public PartnerWorkplaceDTO? Business { get; set; }
    }
}
