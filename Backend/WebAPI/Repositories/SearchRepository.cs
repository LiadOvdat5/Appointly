using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebAPI.Data;
using WebAPI.DTOs;
using WebAPI.Interfaces;
using WebAPI.Mappers;

namespace WebAPI.Repositories
{
    public class SearchRepository : ISearchRepository
    {
        private readonly AppDbContext _context;
        private readonly IServiceScheduleRepository _scheduleRepository;
        private readonly IBusinessRepository _businessRepository;
        public async Task<IEnumerable<BusinessDTO>> SearchByNameAsync(string searchText)
        {
            var allBusinesses = await _businessRepository.GetAllBusinessesAsync(null);
            var normalized = searchText?.Trim().ToLower() ?? string.Empty;
            if (string.IsNullOrEmpty(normalized)) return new List<BusinessDTO>();
            // Load business DTOs (with categories) and filter by name (case-insensitive partial match)
            return allBusinesses.Where(b => b.Name != null && b.Name.ToLower().Contains(normalized)).ToList();
        }

        public async Task<IEnumerable<BusinessSearchResultDTO>> SearchByCategoryAvailabilityAsync(Guid? categoryId, DateTime from, DateTime to, int? durationMinutes = null)
        {
            // Find services — optionally filtered by category
            var query = _context.Services.AsQueryable();
            if (categoryId.HasValue)
                query = query.Where(s => s.CategoryId == categoryId.Value);
            var services = await query.ToListAsync();

            var businesses = new Dictionary<Guid, BusinessSearchResultDTO>();

            foreach (var service in services)
            {
                var slots = await _scheduleRepository.GetAvailableSlotsAsync(service.Id, from, to);

                if (durationMinutes.HasValue)
                {
                    slots = slots.Where(s => (s.EndDateTime - s.StartDateTime).TotalMinutes >= durationMinutes.Value).ToList();
                }

                if (!slots.Any()) continue; // no availability for this service in range

                var sws = new ServiceWithSlotsDTO
                {
                    Service = ServiceMapper.ToServiceDTO(service),
                    AvailableSlots = slots.Select(ServiceScheduleMapper.ToDTO).ToList()
                };

                if (!businesses.ContainsKey(service.BusinessId))
                {
                    var businessDto = await _businessRepository.GetBusinessByIdAsync(service.BusinessId);
                    businesses[service.BusinessId] = new BusinessSearchResultDTO { Business = businessDto };
                }

                businesses[service.BusinessId].Services.Add(sws);
            }

            // Only return businesses that have matching services with slots
            return businesses.Values.ToList();
        }

        public SearchRepository(AppDbContext context, IServiceScheduleRepository scheduleRepository, IBusinessRepository businessRepository)
        {
            _context = context;
            _scheduleRepository = scheduleRepository;
            _businessRepository = businessRepository;
        }

        public async Task<IEnumerable<BusinessDTO>> SearchByCategoryAsync(Guid categoryId)
        {
            return await _businessRepository.GetAllBusinessesAsync(categoryId);
        }

        public async Task<IEnumerable<BusinessDTO>> GetAllAsync()
        {
            return await _businessRepository.GetAllBusinessesAsync(null);
        }
    }
}
