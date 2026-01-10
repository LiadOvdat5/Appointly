using System;

namespace WebAPI.DTOs
{
    public class SlotsGenerationResultDTO
    {
        public int TotalSlotsCreated { get; set; }
        public int AverageSlotsPerDay { get; set; }
        public DateTime GenerationStartDate { get; set; }
        public DateTime GenerationEndDate { get; set; }
        public int DaysInRange { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
