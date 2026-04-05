namespace WebAPI.DTOs
{
    public class SuggestCategoryRequestDTO
    {
        public string Description { get; set; } = string.Empty;
    }

    public class PreviewCategoryNameResponseDTO
    {
        public string? SuggestedName { get; set; }
        public string? SuggestedIcon { get; set; }
    }

    public class CreateCategoryRequestDTO
    {
        public string Description { get; set; } = string.Empty;
    }

    public class CategoryRequestResponseDTO
    {
        public Guid Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? AiSuggestedName { get; set; }
        public string? AiSuggestedIcon { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
    }
}
