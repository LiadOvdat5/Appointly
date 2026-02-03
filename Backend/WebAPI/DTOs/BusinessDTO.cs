namespace WebAPI.DTOs
{
    public class BusinessDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        // Derived categories aggregated from services
        public List<CategoryDTO> Categories { get; set; } = new();
    }
}