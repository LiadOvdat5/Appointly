using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Models;

namespace WebAPI.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly AppDbContext _context;

        public CategoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CategoryDTO> CreateCategoryAsync(CreateCategoryDTO createCategoryDto)
        {
            var existing = await _context.Categories.FirstOrDefaultAsync(c => c.Name == createCategoryDto.Name);
            if (existing != null)
                throw new InvalidOperationException("Category with the same name already exists.");

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = createCategoryDto.Name,
                Description = createCategoryDto.Description
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return new CategoryDTO { Id = category.Id, Name = category.Name, Description = category.Description };
        }

        public async Task<IEnumerable<CategoryDTO>> GetAllCategoriesAsync()
        {
            return await _context.Categories
                .Select(c => new CategoryDTO { Id = c.Id, Name = c.Name, Description = c.Description })
                .ToListAsync();
        }

        public async Task<CategoryDTO> UpdateCategoryAsync(Guid categoryId, CreateCategoryDTO updateDto)
        {
            var category = await _context.Categories.FindAsync(categoryId)
                ?? throw new KeyNotFoundException("Category not found.");

            // Check uniqueness
            var other = await _context.Categories.FirstOrDefaultAsync(c => c.Name == updateDto.Name && c.Id != categoryId);
            if (other != null)
                throw new InvalidOperationException("Another category with the same name exists.");
            category.Name = updateDto.Name;
            category.Description = updateDto.Description;

            _context.Categories.Update(category);
            await _context.SaveChangesAsync();

            return new CategoryDTO { Id = category.Id, Name = category.Name, Description = category.Description };
        }

        public async Task DeleteCategoryAsync(Guid categoryId)
        {
            var category = await _context.Categories.FindAsync(categoryId)
                ?? throw new KeyNotFoundException("Category not found.");

            // Prevent deletion if referenced by any service
            var referenced = await _context.Services.AnyAsync(s => s.CategoryId == categoryId);
            if (referenced)
                throw new InvalidOperationException("Cannot delete category because one or more services reference it.");

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
        }

        public async Task<Category?> GetByIdAsync(Guid categoryId)
        {
            return await _context.Categories.FindAsync(categoryId);
        }
    }
}