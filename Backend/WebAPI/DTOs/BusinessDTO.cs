namespace WebAPI.DTOs
{
    public class BusinessDTO
    {
        public Guid Id { get; set; }
        public Guid OwnerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? ThemeColor { get; set; }
        public string? LogoUrl { get; set; }
        public string? BannerUrl { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        // Derived categories aggregated from services
        public List<CategoryDTO> Categories { get; set; } = new();
    }
}