using WebAPI.Interfaces;
using WebAPI.DTOs;
using WebAPI.Data;
using WebAPI.Models;
using WebAPI.Mappers;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Repositories
{
    public class BusinessRepository : IBusinessRepository
    {
        private readonly AppDbContext _context;
        private readonly IUserRepository _userRepository;

        public BusinessRepository(AppDbContext context, IUserRepository userRepository)
        {
            _context = context;
            _userRepository = userRepository;
        }

        public async Task<BusinessDTO> CreateBusinessAsync(Guid ownerId, CreateBusinessDTO createBusinessDto)
        {
            if (string.IsNullOrWhiteSpace(createBusinessDto.Name))
                throw new ArgumentException("Business name is required.");

            var business = BusinessMapper.ToBusiness(ownerId, createBusinessDto);

            _context.Businesses.Add(business);
            await _context.SaveChangesAsync();

            await _userRepository.UpdateUserRoleToOwnerAsync(ownerId);

            return BusinessMapper.ToBusinessDTO(business);
        }

        public async Task<BusinessDTO> GetBusinessByIdAsync(Guid id)
        {
            var business = await _context.Businesses.FindAsync(id);
            if (business == null)
                throw new KeyNotFoundException($"Business with ID {id} not found.");

            return BusinessMapper.ToBusinessDTO(business);
        }

        public async Task<IEnumerable<BusinessDTO>> GetAllBusinessesAsync()
        {
            var businesses = await _context.Businesses.ToListAsync();
            return businesses.Select(b => BusinessMapper.ToBusinessDTO(b)).ToList();
        }

        public async Task<BusinessDTO> UpdateBusinessAsync(Guid businessId, Guid userId, UpdateBusinessDTO updateBusinessDto)
        {
            var business = await _context.Businesses.FindAsync(businessId);
            if (business == null)
                throw new KeyNotFoundException($"Business with ID {businessId} not found.");

            if (business.OwnerId != userId)
                throw new UnauthorizedAccessException("You can only update your own business.");

            BusinessMapper.UpdateBusinessFromDTO(business, updateBusinessDto);

            _context.Businesses.Update(business);
            await _context.SaveChangesAsync();

            return BusinessMapper.ToBusinessDTO(business);
        }


    }
}