using WebAPI.DTOs;
using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface ICategoryRepository
    {
        Task<CategoryDTO> CreateCategoryAsync(CreateCategoryDTO createCategoryDto);
        Task<IEnumerable<CategoryDTO>> GetAllCategoriesAsync();
        Task<CategoryDTO> UpdateCategoryAsync(Guid categoryId, CreateCategoryDTO updateDto);
        Task DeleteCategoryAsync(Guid categoryId);
        Task<Category?> GetByIdAsync(Guid categoryId);
    }
}