using Microsoft.AspNetCore.Mvc;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Services;
using WebAPI.Data;
using WebAPI.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("categories")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IGeminiService _gemini;
        private readonly AppDbContext _context;

        public CategoryController(ICategoryRepository categoryRepository, IGeminiService gemini, AppDbContext context)
        {
            _categoryRepository = categoryRepository;
            _gemini = gemini;
            _context = context;
        }

        [Authorize(Roles = "admin")]
        [HttpPost]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryDTO dto)
        {
            try
            {
                var created = await _categoryRepository.CreateCategoryAsync(dto);
                return CreatedAtAction(nameof(CreateCategory), new { id = created.Id }, created);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryRepository.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [Authorize(Roles = "admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] CreateCategoryDTO dto)
        {
            try
            {
                var updated = await _categoryRepository.UpdateCategoryAsync(id, dto);
                return Ok(updated);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize(Roles = "admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(Guid id)
        {
            try
            {
                await _categoryRepository.DeleteCategoryAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// US-12-B-01 helper: Ask AI to propose a new generic category name + icon for a description,
        /// WITHOUT storing anything. Used to show the owner a preview before they confirm the request.
        /// </summary>
        [Authorize]
        [HttpPost("preview-name")]
        public async Task<IActionResult> PreviewCategoryName([FromBody] SuggestCategoryRequestDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Description))
                return BadRequest(new { error = "Description is required." });

            try
            {
                var (name, icon) = await _gemini.GenerateCategoryNameAsync(dto.Description);
                return Ok(new PreviewCategoryNameResponseDTO
                {
                    SuggestedName = name?.Trim(),
                    SuggestedIcon = icon?.Trim()
                });
            }
            catch
            {
                return StatusCode(503, new { error = "AI service is temporarily unavailable." });
            }
        }

        /// <summary>
        /// US-12-B-01: Given a plain-text description, return up to 3 existing categories that best match.
        /// </summary>
        [Authorize]
        [HttpPost("suggest")]
        public async Task<IActionResult> SuggestCategories([FromBody] SuggestCategoryRequestDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Description))
                return BadRequest(new { error = "Description is required." });

            var all = (await _categoryRepository.GetAllCategoriesAsync()).ToList();
            if (all.Count == 0)
                return Ok(Array.Empty<CategoryDTO>());

            List<string> matchedNames;
            try
            {
                matchedNames = await _gemini.SuggestCategoryNamesAsync(dto.Description, all.Select(c => c.Name));
            }
            catch
            {
                return StatusCode(503, new { error = "AI service is temporarily unavailable. Please select a category manually." });
            }

            var results = matchedNames
                .Select(name => all.FirstOrDefault(c => string.Equals(c.Name, name, StringComparison.OrdinalIgnoreCase)))
                .Where(c => c != null)
                .Cast<CategoryDTO>()
                .ToList();

            return Ok(results);
        }

        /// <summary>
        /// US-12-B-02: Submit a new category request. AI proposes a generic name + icon and stores as Pending.
        /// </summary>
        [Authorize]
        [HttpPost("request")]
        public async Task<IActionResult> RequestCategory([FromBody] CreateCategoryRequestDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Description))
                return BadRequest(new { error = "Description is required." });

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;

            if (!Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            string? aiName = null;
            string? aiIcon = null;
            try
            {
                (aiName, aiIcon) = await _gemini.GenerateCategoryNameAsync(dto.Description);
            }
            catch
            {
                // Non-fatal — store the request without AI suggestion
            }

            var categoryRequest = new CategoryRequest
            {
                Id = Guid.NewGuid(),
                RequestedByUserId = userId,
                Description = dto.Description.Trim(),
                AiSuggestedName = aiName?.Trim(),
                AiSuggestedIcon = aiIcon?.Trim(),
                Status = CategoryRequestStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.CategoryRequests.Add(categoryRequest);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(RequestCategory), new { id = categoryRequest.Id }, new CategoryRequestResponseDTO
            {
                Id = categoryRequest.Id,
                Description = categoryRequest.Description,
                AiSuggestedName = categoryRequest.AiSuggestedName,
                AiSuggestedIcon = categoryRequest.AiSuggestedIcon,
                Status = categoryRequest.Status.ToString(),
                CreatedAt = categoryRequest.CreatedAt
            });
        }
    }
}