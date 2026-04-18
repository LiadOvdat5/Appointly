using System.ComponentModel.DataAnnotations;

namespace WebAPI.DTOs
{
    public class BlockSlotRequestDTO
    {
        [MaxLength(500)]
        public string? Note { get; set; }
    }
}
