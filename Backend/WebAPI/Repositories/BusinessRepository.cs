using WebAPI.Interfaces;
using WebAPI.DTOs;
using WebAPI.Data;
using WebAPI.Models;
using WebAPI.Mappers;

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


    }
}