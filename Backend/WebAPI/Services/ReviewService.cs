using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Models;
using WebAPI.Utilities;

namespace WebAPI.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IAppointmentRepository _appointmentRepository;
        private readonly IBusinessRepository _businessRepository;

        public ReviewService(
            IReviewRepository reviewRepository,
            IAppointmentRepository appointmentRepository,
            IBusinessRepository businessRepository)
        {
            _reviewRepository = reviewRepository;
            _appointmentRepository = appointmentRepository;
            _businessRepository = businessRepository;
        }

        public async Task<ReviewDTO> CreateReviewAsync(Guid businessId, CreateReviewDTO dto, Guid customerId)
        {
            // Load the appointment
            var appointment = await _appointmentRepository.GetByIdAsync(dto.AppointmentId);
            if (appointment == null)
                throw new InvalidAppointmentOperationException($"Appointment '{dto.AppointmentId}' not found.");

            // Caller must be the client who had the appointment
            if (appointment.ClientId != customerId)
                throw new UnauthorizedAppointmentAccessException("You can only review appointments you attended.");

            // Appointment must belong to the given business
            if (appointment.BusinessId != businessId)
                throw new InvalidAppointmentOperationException("This appointment does not belong to the specified business.");

            // Appointment must be completed
            if (appointment.Status != AppointmentStatus.completed)
                throw new InvalidAppointmentOperationException("You can only review completed appointments.");

            // One review per appointment
            var existing = await _reviewRepository.GetByAppointmentIdAsync(dto.AppointmentId);
            if (existing != null)
                throw new DuplicateReviewException(dto.AppointmentId);

            var review = new Review
            {
                Id = Guid.NewGuid(),
                BusinessId = businessId,
                CustomerId = customerId,
                AppointmentId = dto.AppointmentId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _reviewRepository.CreateAsync(review);

            // Update business aggregate stats
            var (avg, count) = await _reviewRepository.GetRatingStatsAsync(businessId);
            await _businessRepository.UpdateRatingAsync(businessId, avg, count);

            return ToDTO(created, null);
        }

        public async Task<List<ReviewDTO>> GetReviewsForBusinessAsync(Guid businessId, int page = 1, int pageSize = 20)
        {
            var reviews = await _reviewRepository.GetByBusinessIdAsync(businessId, page, pageSize);
            return reviews.Select(r => ToDTO(r, r.Customer?.Name)).ToList();
        }

        private static ReviewDTO ToDTO(Review r, string? customerName) => new()
        {
            Id = r.Id,
            BusinessId = r.BusinessId,
            CustomerId = r.CustomerId,
            CustomerName = customerName ?? string.Empty,
            AppointmentId = r.AppointmentId,
            Rating = r.Rating,
            Comment = r.Comment,
            CreatedAt = r.CreatedAt
        };
    }
}
