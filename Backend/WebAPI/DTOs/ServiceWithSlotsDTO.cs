using System.Collections.Generic;

namespace WebAPI.DTOs
{
    public class ServiceWithSlotsDTO
    {
        public ServiceDTO Service { get; set; } = new ServiceDTO();
        public List<ServiceScheduleDTO> AvailableSlots { get; set; } = new List<ServiceScheduleDTO>();
    }
}