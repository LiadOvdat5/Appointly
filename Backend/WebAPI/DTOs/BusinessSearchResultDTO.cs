using System.Collections.Generic;

namespace WebAPI.DTOs
{
    public class BusinessSearchResultDTO
    {
        public BusinessDTO Business { get; set; } = new BusinessDTO();
        public List<ServiceWithSlotsDTO> Services { get; set; } = new List<ServiceWithSlotsDTO>();
    }
}