namespace WebAPI.DTOs
{
    public class ServiceDTO
    {
        public Guid Id { get; set; }
        public Guid BusinessId { get; set; }
        public Guid PartnerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Duration { get; set; }
        public decimal? Price { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}