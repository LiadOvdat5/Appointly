using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;
using WebAPI.Interfaces;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/search/businesses")]
    public class SearchController : ControllerBase
    {
        private readonly ISearchRepository _searchRepository;

        public SearchController(ISearchRepository searchRepository)
        {
            _searchRepository = searchRepository;
        }

        [HttpGet("by-category")]
        public async Task<IActionResult> GetByCategory([FromQuery] Guid categoryId)
        {
            try
            {
                var results = await _searchRepository.SearchByCategoryAsync(categoryId);
                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("by-category-availability")]
        public async Task<IActionResult> GetByCategoryAvailability([FromQuery] Guid? categoryId, [FromQuery] DateTime from, [FromQuery] DateTime to, [FromQuery] int? durationMinutes = null)
        {
            try
            {
                var results = await _searchRepository.SearchByCategoryAvailabilityAsync(categoryId, from, to, durationMinutes);
                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var results = await _searchRepository.GetAllAsync();
                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("by-name")]
        public async Task<IActionResult> GetByName([FromQuery] string text)
        {
            try
            {
                var results = await _searchRepository.SearchByNameAsync(text);
                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}