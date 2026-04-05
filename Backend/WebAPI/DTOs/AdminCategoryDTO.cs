namespace WebAPI.DTOs
{
    public class AdminCategoryRequestDTO
    {
        public Guid Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? AiSuggestedName { get; set; }
        public string? AiSuggestedIcon { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
        public string RequesterName { get; set; } = string.Empty;
        public string RequesterEmail { get; set; } = string.Empty;
        public Guid? BusinessId { get; set; }
        public string? BusinessName { get; set; }
    }

    public class ApproveCategoryRequestDTO
    {
        /// <summary>Override the AI-suggested name. If null, uses AiSuggestedName.</summary>
        public string? Name { get; set; }
        /// <summary>Override the AI-suggested icon. If null, uses AiSuggestedIcon.</summary>
        public string? IconName { get; set; }
    }
}
