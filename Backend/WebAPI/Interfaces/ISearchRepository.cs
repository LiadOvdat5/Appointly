using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI.DTOs;

namespace WebAPI.Interfaces
{
    public interface ISearchRepository
    {
        Task<IEnumerable<BusinessDTO>> SearchByCategoryAsync(Guid categoryId);
        Task<IEnumerable<BusinessSearchResultDTO>> SearchByCategoryAvailabilityAsync(Guid? categoryId, DateTime from, DateTime to, int? durationMinutes = null);
        Task<IEnumerable<BusinessDTO>> SearchByNameAsync(string searchText);
        Task<IEnumerable<BusinessDTO>> GetAllAsync();
    }
}