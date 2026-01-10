using System;
using System.ComponentModel.DataAnnotations;

namespace WebAPI.DTOs
{
    public class GenerateSlotsDateRangeDTO
    {
        [Required(ErrorMessage = "StartDate is required.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "EndDate is required.")]
        public DateTime EndDate { get; set; }
    }
}
