using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebAPI.Models;

namespace WebAPI.Interfaces
{
    public interface IDateExceptionRepository
    {
        Task<DateException?> GetByIdAsync(Guid id);
        Task<List<DateException>> GetByServiceIdAsync(Guid serviceId);
        Task<DateException?> GetByDateAsync(Guid serviceId, DateTime date);
        Task<DateException> CreateAsync(DateException exception);
        Task<DateException> UpdateAsync(DateException exception);
        Task<bool> DeleteAsync(Guid id);
    }
}
