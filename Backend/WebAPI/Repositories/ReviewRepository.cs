using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        private readonly AppDbContext _context;

        public ReviewRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Review?> GetByIdAsync(Guid id)
        {
            return await _context.Reviews
                .Include(r => r.Customer)
                .Include(r => r.Appointment).ThenInclude(a => a!.Service)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<Review?> GetByAppointmentIdAsync(Guid appointmentId)
        {
            return await _context.Reviews
                .FirstOrDefaultAsync(r => r.AppointmentId == appointmentId);
        }

        public async Task<List<Review>> GetByBusinessIdAsync(Guid businessId, int page = 1, int pageSize = 20)
        {
            return await _context.Reviews
                .Include(r => r.Customer)
                .Include(r => r.Appointment).ThenInclude(a => a!.Service)
                .Where(r => r.BusinessId == businessId)
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<Review> CreateAsync(Review review)
        {
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();
            return review;
        }

        public async Task<(double averageRating, int reviewCount)> GetRatingStatsAsync(Guid businessId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.BusinessId == businessId)
                .ToListAsync();

            if (reviews.Count == 0)
                return (0, 0);

            var avg = reviews.Average(r => r.Rating);
            return (Math.Round(avg, 1), reviews.Count);
        }

        public async Task<Review?> FlagAsync(Guid reviewId, string reason)
        {
            var review = await _context.Reviews
                .Include(r => r.Customer)
                .Include(r => r.Appointment).ThenInclude(a => a!.Service)
                .FirstOrDefaultAsync(r => r.Id == reviewId);

            if (review == null) return null;

            review.IsFlagged = true;
            review.FlagReason = reason;
            await _context.SaveChangesAsync();
            return review;
        }
    }
}
