using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI.DTOs;

namespace WebAPI.Interfaces
{
    public interface IReviewService
    {
        Task<ReviewDTO> CreateReviewAsync(Guid businessId, CreateReviewDTO dto, Guid customerId);
        Task<List<ReviewDTO>> GetReviewsForBusinessAsync(Guid businessId, int page = 1, int pageSize = 20);
    }
}
