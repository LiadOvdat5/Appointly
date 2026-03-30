using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface IReviewRepository
    {
        Task<Review?> GetByIdAsync(Guid id);
        Task<Review?> GetByAppointmentIdAsync(Guid appointmentId);
        Task<List<Review>> GetByBusinessIdAsync(Guid businessId, int page = 1, int pageSize = 20);
        Task<Review> CreateAsync(Review review);
        Task<(double averageRating, int reviewCount)> GetRatingStatsAsync(Guid businessId);
        Task<Review?> FlagAsync(Guid reviewId, string reason);
    }
}
