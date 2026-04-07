using WebAPI.Interfaces;
using WebAPI.DTOs;
using WebAPI.Data;
using WebAPI.Models;
using WebAPI.Mappers;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

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

        private static string GenerateBaseSlug(string name)
        {
            var slug = name.ToLowerInvariant();
            slug = slug.Replace(" ", "-");
            slug = Regex.Replace(slug, @"[^a-z0-9\-]", "");
            slug = Regex.Replace(slug, @"-{2,}", "-");
            slug = slug.Trim('-');
            return string.IsNullOrEmpty(slug) ? "business" : slug;
        }

        private async Task<string> GetUniqueSlugAsync(string baseName)
        {
            var baseSlug = GenerateBaseSlug(baseName);
            var candidate = baseSlug;
            var counter = 2;
            while (await _context.Businesses.AnyAsync(b => b.Slug == candidate))
            {
                candidate = $"{baseSlug}-{counter}";
                counter++;
            }
            return candidate;
        }

        public async Task<BusinessDTO> CreateBusinessAsync(Guid ownerId, CreateBusinessDTO createBusinessDto)
        {
            if (string.IsNullOrWhiteSpace(createBusinessDto.Name))
                throw new ArgumentException("Business name is required.");

            var business = BusinessMapper.ToBusiness(ownerId, createBusinessDto);
            business.Slug = await GetUniqueSlugAsync(createBusinessDto.Name);

            // Auto-add owner as an Accepted partner so they can be assigned to services
            business.Partners.Add(new BusinessPartner
            {
                BusinessId = business.Id,
                UserId = ownerId,
                Status = InvitationStatus.Accepted,
                InvitationId = null,
                JoinedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            });

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

            // Convert stored string IDs to GUIDs and load categories
            var categoryGuids = new List<Guid>();
            if (business.CategoryIds != null && business.CategoryIds.Any())
            {
                categoryGuids = business.CategoryIds.Select(Guid.Parse).ToList();
            }

            var categories = new List<CategoryDTO>();
            if (categoryGuids.Any())
            {
                categories = await _context.Categories
                    .Where(c => categoryGuids.Contains(c.Id))
                    .Select(c => new CategoryDTO { Id = c.Id, Name = c.Name, Description = c.Description, IconName = c.IconName })
                    .ToListAsync();
            }

            return BusinessMapper.ToBusinessDTO(business, categories);
        }

        public async Task<BusinessDTO> GetBusinessBySlugAsync(string slug)
        {
            var business = await _context.Businesses
                .FirstOrDefaultAsync(b => b.Slug == slug.ToLowerInvariant());
            if (business == null)
                throw new KeyNotFoundException($"Business with slug '{slug}' not found.");

            var categoryGuids = new List<Guid>();
            if (business.CategoryIds != null && business.CategoryIds.Any())
                categoryGuids = business.CategoryIds.Select(Guid.Parse).ToList();

            var categories = new List<CategoryDTO>();
            if (categoryGuids.Any())
            {
                categories = await _context.Categories
                    .Where(c => categoryGuids.Contains(c.Id))
                    .Select(c => new CategoryDTO { Id = c.Id, Name = c.Name, Description = c.Description, IconName = c.IconName })
                    .ToListAsync();
            }

            return BusinessMapper.ToBusinessDTO(business, categories);
        }

        public async Task<Business?> GetBusinessEntityByIdAsync(Guid id)
        {
            return await _context.Businesses.FindAsync(id);
        }

        public async Task<IEnumerable<BusinessDTO>> GetAllBusinessesAsync(Guid? categoryId = null)
        {
            // Load all non-suspended businesses and apply category filter in memory to handle string storage of category IDs
            var businesses = await _context.Businesses
                .Where(b => !b.IsSuspended)
                .ToListAsync();
            if (categoryId.HasValue)
            {
                var categoryIdString = categoryId.Value.ToString();
                businesses = businesses.Where(b => b.CategoryIds != null && b.CategoryIds.Contains(categoryIdString)).ToList();
            }

            var result = new List<BusinessDTO>();
            foreach (var b in businesses)
            {
                var categories = new List<CategoryDTO>();
                if (b.CategoryIds != null && b.CategoryIds.Any())
                {
                    var categoryGuids = b.CategoryIds.Select(Guid.Parse).ToList();
                    categories = await _context.Categories
                        .Where(c => categoryGuids.Contains(c.Id))
                        .Select(c => new CategoryDTO { Id = c.Id, Name = c.Name, Description = c.Description, IconName = c.IconName })
                        .ToListAsync();
                }

                result.Add(BusinessMapper.ToBusinessDTO(b, categories));
            }

            return result;
        }

        public async Task<IEnumerable<BusinessDTO>> GetBusinessesByOwnerAsync(Guid ownerId)
        {
            var businesses = await _context.Businesses
                .Where(b => b.OwnerId == ownerId)
                .ToListAsync();

            var result = new List<BusinessDTO>();
            foreach (var b in businesses)
            {
                var categories = new List<CategoryDTO>();
                if (b.CategoryIds != null && b.CategoryIds.Any())
                {
                    var categoryGuids = b.CategoryIds.Select(Guid.Parse).ToList();
                    categories = await _context.Categories
                        .Where(c => categoryGuids.Contains(c.Id))
                        .Select(c => new CategoryDTO { Id = c.Id, Name = c.Name, Description = c.Description, IconName = c.IconName })
                        .ToListAsync();
                }
                result.Add(BusinessMapper.ToBusinessDTO(b, categories));
            }

            return result;
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

        public async Task<BusinessDTO> UpdateBusinessLogoAsync(Guid businessId, Guid userId, string logoUrl)
        {
            var business = await _context.Businesses.FindAsync(businessId);
            if (business == null)
                throw new KeyNotFoundException($"Business with ID {businessId} not found.");

            if (business.OwnerId != userId)
                throw new UnauthorizedAccessException("You can only update your own business.");

            business.LogoUrl = logoUrl;
            business.UpdatedAt = DateTime.UtcNow;
            _context.Businesses.Update(business);
            await _context.SaveChangesAsync();

            return BusinessMapper.ToBusinessDTO(business);
        }

        public async Task<BusinessDTO> UpdateBusinessBannerAsync(Guid businessId, Guid userId, string bannerUrl)
        {
            var business = await _context.Businesses.FindAsync(businessId);
            if (business == null)
                throw new KeyNotFoundException($"Business with ID {businessId} not found.");

            if (business.OwnerId != userId)
                throw new UnauthorizedAccessException("You can only update your own business.");

            business.BannerUrl = bannerUrl;
            business.UpdatedAt = DateTime.UtcNow;
            _context.Businesses.Update(business);
            await _context.SaveChangesAsync();

            return BusinessMapper.ToBusinessDTO(business);
        }

        public async Task<BusinessDTO> UpdateBusinessSearchImageAsync(Guid businessId, Guid userId, string searchImageUrl)
        {
            var business = await _context.Businesses.FindAsync(businessId);
            if (business == null)
                throw new KeyNotFoundException($"Business with ID {businessId} not found.");

            if (business.OwnerId != userId)
                throw new UnauthorizedAccessException("You can only update your own business.");

            business.SearchImageUrl = searchImageUrl;
            business.UpdatedAt = DateTime.UtcNow;
            _context.Businesses.Update(business);
            await _context.SaveChangesAsync();

            return BusinessMapper.ToBusinessDTO(business);
        }

        public async Task UpdateRatingAsync(Guid businessId, double averageRating, int reviewCount)
        {
            var business = await _context.Businesses.FindAsync(businessId);
            if (business == null) return;

            business.AverageRating = averageRating;
            business.ReviewCount = reviewCount;
            business.UpdatedAt = DateTime.UtcNow;
            _context.Businesses.Update(business);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateNotificationSettingsAsync(
            Guid businessId, Guid ownerId, bool? notifyOnNewBooking, bool? notifyOnCancellation)
        {
            var business = await _context.Businesses.FindAsync(businessId)
                ?? throw new KeyNotFoundException("Business not found.");

            if (business.OwnerId != ownerId)
                throw new UnauthorizedAccessException();

            if (notifyOnNewBooking.HasValue)
                business.NotifyOnNewBooking = notifyOnNewBooking.Value;

            if (notifyOnCancellation.HasValue)
                business.NotifyOnCancellation = notifyOnCancellation.Value;

            business.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}