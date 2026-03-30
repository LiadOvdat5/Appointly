using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Utilities;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/businesses/{businessId}/reviews")]
    [Authorize]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        private Guid? GetCurrentUserId() => User.GetUserId();

        /// <summary>
        /// Submit a review for a business after a completed appointment
        /// </summary>
        [HttpPost]
        [EndpointSummary("Submit Review")]
        [EndpointDescription("Submit a star rating and optional comment for a business after a completed appointment. " +
            "Caller must be the customer who attended the appointment. " +
            "Returns 409 Conflict if a review for this appointment already exists.")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<ReviewDTO>> SubmitReview(Guid businessId, [FromBody] CreateReviewDTO dto)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
                return Unauthorized("User is not authenticated.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var review = await _reviewService.CreateReviewAsync(businessId, dto, userId.Value);
                return StatusCode(StatusCodes.Status201Created, review);
            }
            catch (DuplicateReviewException ex)
            {
                return Conflict(ex.Message);
            }
            catch (UnauthorizedAppointmentAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ex.Message);
            }
            catch (InvalidAppointmentOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"An error occurred while submitting the review: {ex.Message}");
            }
        }

        /// <summary>
        /// Get reviews for a business (public)
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        [EndpointSummary("Get Business Reviews")]
        [EndpointDescription("Retrieve paginated reviews for a business, ordered by most recent first.")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<ReviewDTO>>> GetReviews(
            Guid businessId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var reviews = await _reviewService.GetReviewsForBusinessAsync(businessId, page, pageSize);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    $"An error occurred while retrieving reviews: {ex.Message}");
            }
        }
    }
}
