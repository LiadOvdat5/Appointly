using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebAPI.Models;
using WebAPI.Services;

namespace WebAPI.Data
{
    /// <summary>
    /// Seeds realistic demo data: 3 customers, 4 business owners, 6 staff,
    /// 4 businesses with services, weekly working rules, breaks, date exceptions, and slots.
    /// Idempotent — skips if marco@demo.com already exists.
    /// </summary>
    public class DemoDataSeeder
    {
        private readonly AppDbContext _db;
        private readonly SlotGenerationService _slotGen;
        private readonly ILogger<DemoDataSeeder> _logger;

        // ── Category GUIDs (seeded in AppDbContext) ───────────────────────────
        private static readonly Guid CatMensHaircut  = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e01");
        private static readonly Guid CatWomensHaircut= Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e02");
        private static readonly Guid CatBeardTrim    = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e03");
        private static readonly Guid CatHairColoring = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e04");
        private static readonly Guid CatGelNails     = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e06");
        private static readonly Guid CatManicure     = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e07");
        private static readonly Guid CatPedicure     = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e08");
        private static readonly Guid CatEyebrow      = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e09");
        private static readonly Guid CatFacial       = Guid.Parse("4b9a5c9a-6d9f-4f6e-8b9d-1a2b3c4d5e10");

        // ── Fixed User GUIDs ──────────────────────────────────────────────────
        private static readonly Guid UDavid    = Guid.Parse("d1000001-0000-0000-0000-000000000001");
        private static readonly Guid UMiriam   = Guid.Parse("d1000001-0000-0000-0000-000000000002");
        private static readonly Guid UAvi      = Guid.Parse("d1000001-0000-0000-0000-000000000003");
        private static readonly Guid UMarco    = Guid.Parse("d1000001-0000-0000-0000-000000000004");
        private static readonly Guid UIsabella = Guid.Parse("d1000001-0000-0000-0000-000000000005");
        private static readonly Guid UYasmin   = Guid.Parse("d1000001-0000-0000-0000-000000000006");
        private static readonly Guid USophie   = Guid.Parse("d1000001-0000-0000-0000-000000000007");
        private static readonly Guid UDani     = Guid.Parse("d1000001-0000-0000-0000-000000000008");
        private static readonly Guid UYossi    = Guid.Parse("d1000001-0000-0000-0000-000000000009");
        private static readonly Guid URivka    = Guid.Parse("d1000001-0000-0000-0000-000000000010");
        private static readonly Guid UTali     = Guid.Parse("d1000001-0000-0000-0000-000000000011");
        private static readonly Guid UHila     = Guid.Parse("d1000001-0000-0000-0000-000000000012");
        private static readonly Guid UNoa      = Guid.Parse("d1000001-0000-0000-0000-000000000013");

        // ── Fixed Business GUIDs ──────────────────────────────────────────────
        private static readonly Guid BMarco    = Guid.Parse("b2000001-0000-0000-0000-000000000001");
        private static readonly Guid BBella    = Guid.Parse("b2000001-0000-0000-0000-000000000002");
        private static readonly Guid BGlow     = Guid.Parse("b2000001-0000-0000-0000-000000000003");
        private static readonly Guid BColor    = Guid.Parse("b2000001-0000-0000-0000-000000000004");

        // ── Fixed Service GUIDs ───────────────────────────────────────────────
        // Marco's Barbershop
        private static readonly Guid SMarcoCut   = Guid.Parse("c3000001-0000-0000-0000-000000000001");
        private static readonly Guid SBeard      = Guid.Parse("c3000001-0000-0000-0000-000000000002");
        private static readonly Guid SCombo      = Guid.Parse("c3000001-0000-0000-0000-000000000003");
        // Bella Nail Studio
        private static readonly Guid SGel        = Guid.Parse("c3000001-0000-0000-0000-000000000004");
        private static readonly Guid SManicure   = Guid.Parse("c3000001-0000-0000-0000-000000000005");
        private static readonly Guid SPedicure   = Guid.Parse("c3000001-0000-0000-0000-000000000006");
        // Glow Facial Spa
        private static readonly Guid SFacial     = Guid.Parse("c3000001-0000-0000-0000-000000000007");
        private static readonly Guid SEyebrow    = Guid.Parse("c3000001-0000-0000-0000-000000000008");
        private static readonly Guid SDeepFacial = Guid.Parse("c3000001-0000-0000-0000-000000000009");
        // Coloriste Hair Salon
        private static readonly Guid SWomensCut  = Guid.Parse("c3000001-0000-0000-0000-000000000010");
        private static readonly Guid SColoring   = Guid.Parse("c3000001-0000-0000-0000-000000000011");
        private static readonly Guid SCutColor   = Guid.Parse("c3000001-0000-0000-0000-000000000012");

        private const string DemoPassword = "Demo1234!";

        public DemoDataSeeder(AppDbContext db, SlotGenerationService slotGen, ILogger<DemoDataSeeder> logger)
        {
            _db = db;
            _slotGen = slotGen;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            if (await _db.Users.AnyAsync(u => u.Email == "marco@demo.com"))
            {
                _logger.LogInformation("Demo data already seeded — skipping.");
                return;
            }

            _logger.LogInformation("Seeding demo data…");

            var now = DateTime.UtcNow;
            var slotStart = now.Date;
            var slotEnd   = now.Date.AddDays(60);

            // 1. Users ─────────────────────────────────────────────────────────
            var hasher = new PasswordHasher<User>();

            User MakeUser(Guid id, string name, string email, UserRole role)
            {
                var u = new User { Id = id, Name = name, Email = email, Role = role, CreatedAt = now, UpdatedAt = now };
                u.Password = hasher.HashPassword(u, DemoPassword);
                return u;
            }

            var users = new[]
            {
                // Customers
                MakeUser(UDavid,    "David Katz",        "david@demo.com",    UserRole.client),
                MakeUser(UMiriam,   "Miriam Goldstein",  "miriam@demo.com",   UserRole.client),
                MakeUser(UAvi,      "Avi Cohen",         "avi@demo.com",      UserRole.client),
                // Owners
                MakeUser(UMarco,    "Marco Rossi",       "marco@demo.com",    UserRole.owner),
                MakeUser(UIsabella, "Isabella Cohen",    "isabella@demo.com", UserRole.owner),
                MakeUser(UYasmin,   "Yasmin Azouri",     "yasmin@demo.com",   UserRole.owner),
                MakeUser(USophie,   "Sophie Levin",      "sophie@demo.com",   UserRole.owner),
                // Staff
                MakeUser(UDani,     "Dani Ben-David",    "dani@demo.com",     UserRole.partner),
                MakeUser(UYossi,    "Yossi Stern",       "yossi@demo.com",    UserRole.partner),
                MakeUser(URivka,    "Rivka Mizrahi",     "rivka@demo.com",    UserRole.partner),
                MakeUser(UTali,     "Tali Shapiro",      "tali@demo.com",     UserRole.partner),
                MakeUser(UHila,     "Hila Peretz",       "hila@demo.com",     UserRole.partner),
                MakeUser(UNoa,      "Noa Levi",          "noa@demo.com",      UserRole.partner),
            };

            await _db.Users.AddRangeAsync(users);
            await _db.SaveChangesAsync();

            // 2. Businesses ────────────────────────────────────────────────────
            var businesses = new[]
            {
                new Business
                {
                    Id = BMarco, OwnerId = UMarco, Name = "Marco's Barbershop",
                    Slug = "marcos-barbershop",
                    Description = "Classic barbershop with modern touch. Expert cuts, fades, and beard work since 2015.",
                    Address = "Allenby St 45, Tel Aviv",
                    Phone = "+972-52-111-2233",
                    Latitude = 32.0737, Longitude = 34.7736,
                    ThemeColor = "#1a1a2e",
                    LogoUrl = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop",
                    BannerUrl = "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1200&h=400&fit=crop",
                    SearchImageUrl = "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&h=400&fit=crop",
                    Timezone = "Asia/Jerusalem", AdvanceBookingDays = 60,
                    CreatedAt = now, UpdatedAt = now,
                },
                new Business
                {
                    Id = BBella, OwnerId = UIsabella, Name = "Bella Nail Studio",
                    Slug = "bella-nail-studio",
                    Description = "Luxurious nail care in the heart of Jerusalem. Gels, acrylics, and artisan nail art.",
                    Address = "Jaffa St 22, Jerusalem",
                    Phone = "+972-52-222-3344",
                    Latitude = 31.7767, Longitude = 35.2345,
                    ThemeColor = "#f8bbd0",
                    LogoUrl = "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=400&fit=crop",
                    BannerUrl = "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&h=400&fit=crop",
                    SearchImageUrl = "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop",
                    Timezone = "Asia/Jerusalem", AdvanceBookingDays = 60,
                    CreatedAt = now, UpdatedAt = now,
                },
                new Business
                {
                    Id = BGlow, OwnerId = UYasmin, Name = "Glow Facial Spa",
                    Slug = "glow-facial-spa",
                    Description = "Your sanctuary for glowing skin. Premium facials, eyebrow shaping, and holistic skin care.",
                    Address = "Moriya Blvd 12, Haifa",
                    Phone = "+972-52-333-4455",
                    Latitude = 32.7940, Longitude = 34.9896,
                    ThemeColor = "#e8f5e9",
                    LogoUrl = "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop",
                    BannerUrl = "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1200&h=400&fit=crop",
                    SearchImageUrl = "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=600&h=400&fit=crop",
                    Timezone = "Asia/Jerusalem", AdvanceBookingDays = 60,
                    CreatedAt = now, UpdatedAt = now,
                },
                new Business
                {
                    Id = BColor, OwnerId = USophie, Name = "Coloriste Hair Salon",
                    Slug = "coloriste-hair-salon",
                    Description = "Tel Aviv's go-to destination for women's cuts and color. Balayage, highlights, and precision cuts.",
                    Address = "Dizengoff St 88, Tel Aviv",
                    Phone = "+972-52-444-5566",
                    Latitude = 32.0853, Longitude = 34.7818,
                    ThemeColor = "#fff3e0",
                    LogoUrl = "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
                    BannerUrl = "https://images.unsplash.com/photo-1560066984-138daaa4e4e1?w=1200&h=400&fit=crop",
                    SearchImageUrl = "https://images.unsplash.com/photo-1560066984-138daaa4e4e1?w=600&h=400&fit=crop",
                    Timezone = "Asia/Jerusalem", AdvanceBookingDays = 60,
                    CreatedAt = now, UpdatedAt = now,
                },
            };

            await _db.Businesses.AddRangeAsync(businesses);
            await _db.SaveChangesAsync();

            // 3. Business Partners ─────────────────────────────────────────────
            // Owners auto-enrolled + staff enrolled directly
            var partners = new[]
            {
                // Marco's Barbershop
                Partner(BMarco, UMarco),
                Partner(BMarco, UDani),
                Partner(BMarco, UYossi),
                // Bella Nail Studio
                Partner(BBella, UIsabella),
                Partner(BBella, URivka),
                // Glow Facial Spa
                Partner(BGlow, UYasmin),
                Partner(BGlow, UTali),
                Partner(BGlow, UHila),
                // Coloriste Hair Salon
                Partner(BColor, USophie),
                Partner(BColor, UNoa),
            };

            await _db.BusinessPartners.AddRangeAsync(partners);
            await _db.SaveChangesAsync();

            // 4. Services ──────────────────────────────────────────────────────
            var services = new[]
            {
                // Marco's Barbershop
                Svc(SMarcoCut,   BMarco, UMarco,    "Men's Haircut",          30, 80m,  CatMensHaircut,  "Classic cut, taper, or fade — styled to your preference."),
                Svc(SBeard,      BMarco, UDani,     "Beard Trim",             20, 50m,  CatBeardTrim,    "Shape, line-up, and conditioning for your beard."),
                Svc(SCombo,      BMarco, UYossi,    "Hair & Beard Combo",     50, 120m, CatMensHaircut,  "Full haircut plus beard trim — the complete package."),
                // Bella Nail Studio
                Svc(SGel,        BBella, UIsabella, "Gel Nails",              60, 150m, CatGelNails,     "Long-lasting gel polish with flawless finish."),
                Svc(SManicure,   BBella, URivka,    "Manicure",               45, 100m, CatManicure,     "Shape, cuticle care, and polish for perfect hands."),
                Svc(SPedicure,   BBella, URivka,    "Pedicure",               60, 120m, CatPedicure,     "Foot soak, exfoliation, and polished finish."),
                // Glow Facial Spa
                Svc(SFacial,     BGlow,  UYasmin,   "Classic Facial",         60, 200m, CatFacial,       "Deep cleanse, exfoliation, and moisturizing treatment."),
                Svc(SEyebrow,    BGlow,  UTali,     "Eyebrow Shaping",        30, 70m,  CatEyebrow,      "Precision threading or waxing for defined brows."),
                Svc(SDeepFacial, BGlow,  UHila,     "Deep Cleansing Facial",  90, 280m, CatFacial,       "Intensive pore treatment with steam, extractions, and mask."),
                // Coloriste Hair Salon
                Svc(SWomensCut,  BColor, USophie,   "Women's Haircut",        45, 120m, CatWomensHaircut,"Precision cut with blow-dry and style finish."),
                Svc(SColoring,   BColor, UNoa,      "Hair Coloring",         120, 350m, CatHairColoring, "Full color, balayage, or highlights tailored to your look."),
                Svc(SCutColor,   BColor, UNoa,      "Cut & Color Package",   150, 450m, CatWomensHaircut,"Precision cut combined with full color service — best value."),
            };

            await _db.Services.AddRangeAsync(services);
            await _db.SaveChangesAsync();

            // Update business CategoryIds
            await RecalcCategories(BMarco,  new[] { SMarcoCut, SBeard, SCombo });
            await RecalcCategories(BBella,  new[] { SGel, SManicure, SPedicure });
            await RecalcCategories(BGlow,   new[] { SFacial, SEyebrow, SDeepFacial });
            await RecalcCategories(BColor,  new[] { SWomensCut, SColoring, SCutColor });

            // 5. Weekly Working Rules ──────────────────────────────────────────
            // DayOfWeek: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun

            var allServiceIds = new[]
            {
                SMarcoCut, SBeard, SCombo,
                SGel, SManicure, SPedicure,
                SFacial, SEyebrow, SDeepFacial,
                SWomensCut, SColoring, SCutColor,
            };

            var weeklyRules = new List<WeeklyWorkingRule>();

            // Marco's Barbershop — Mon-Sat 09:00-19:00, Sun closed
            foreach (var svcId in new[] { SMarcoCut, SBeard, SCombo })
            {
                for (int d = 0; d <= 5; d++) // Mon-Sat
                    weeklyRules.Add(WorkDay(svcId, d, new TimeSpan(9, 0, 0), new TimeSpan(19, 0, 0)));
                weeklyRules.Add(ClosedDay(svcId, 6)); // Sun
            }

            // Bella Nail Studio — Sun-Thu 10:00-18:00, Fri 10:00-14:00, Sat closed
            // In Israeli terms: Mon(0), Tue(1), Wed(2), Thu(3), Sun(6) = 10:00-18:00
            //                   Fri(4) = 10:00-14:00, Sat(5) = closed
            foreach (var svcId in new[] { SGel, SManicure, SPedicure })
            {
                foreach (int d in new[] { 0, 1, 2, 3 }) // Mon-Thu
                    weeklyRules.Add(WorkDay(svcId, d, new TimeSpan(10, 0, 0), new TimeSpan(18, 0, 0)));
                weeklyRules.Add(WorkDay(svcId, 4, new TimeSpan(10, 0, 0), new TimeSpan(14, 0, 0))); // Fri
                weeklyRules.Add(ClosedDay(svcId, 5)); // Sat
                weeklyRules.Add(WorkDay(svcId, 6, new TimeSpan(10, 0, 0), new TimeSpan(18, 0, 0))); // Sun
            }

            // Glow Facial Spa — Mon-Fri 09:00-17:00, Sat 10:00-15:00, Sun closed
            foreach (var svcId in new[] { SFacial, SEyebrow, SDeepFacial })
            {
                for (int d = 0; d <= 4; d++) // Mon-Fri
                    weeklyRules.Add(WorkDay(svcId, d, new TimeSpan(9, 0, 0), new TimeSpan(17, 0, 0)));
                weeklyRules.Add(WorkDay(svcId, 5, new TimeSpan(10, 0, 0), new TimeSpan(15, 0, 0))); // Sat
                weeklyRules.Add(ClosedDay(svcId, 6)); // Sun
            }

            // Coloriste Hair Salon — Mon-Sat 09:00-20:00, Sun 10:00-16:00
            foreach (var svcId in new[] { SWomensCut, SColoring, SCutColor })
            {
                for (int d = 0; d <= 5; d++) // Mon-Sat
                    weeklyRules.Add(WorkDay(svcId, d, new TimeSpan(9, 0, 0), new TimeSpan(20, 0, 0)));
                weeklyRules.Add(WorkDay(svcId, 6, new TimeSpan(10, 0, 0), new TimeSpan(16, 0, 0))); // Sun
            }

            await _db.WeeklyWorkingRules.AddRangeAsync(weeklyRules);
            await _db.SaveChangesAsync();

            // 6. Break Rules ───────────────────────────────────────────────────
            var breakRules = new List<BreakRule>();

            foreach (var svcId in new[] { SMarcoCut, SBeard, SCombo })
                breakRules.Add(Break(svcId, new TimeSpan(13, 0, 0), new TimeSpan(14, 0, 0)));

            foreach (var svcId in new[] { SGel, SManicure, SPedicure })
                breakRules.Add(Break(svcId, new TimeSpan(13, 0, 0), new TimeSpan(13, 30, 0)));

            foreach (var svcId in new[] { SFacial, SEyebrow, SDeepFacial })
                breakRules.Add(Break(svcId, new TimeSpan(12, 30, 0), new TimeSpan(13, 30, 0)));

            foreach (var svcId in new[] { SWomensCut, SColoring, SCutColor })
                breakRules.Add(Break(svcId, new TimeSpan(13, 0, 0), new TimeSpan(14, 0, 0)));

            await _db.BreakRules.AddRangeAsync(breakRules);
            await _db.SaveChangesAsync();

            // 7. Date Exceptions ───────────────────────────────────────────────
            var exceptions = new List<DateException>();

            // Marco's Barbershop closed on Labour Day
            foreach (var svcId in new[] { SMarcoCut, SBeard, SCombo })
                exceptions.Add(ClosedDate(svcId, new DateTime(2026, 5, 1), "Labour Day"));

            // Coloriste short day on Erev Shavuot
            foreach (var svcId in new[] { SWomensCut, SColoring, SCutColor })
                exceptions.Add(ShortDay(svcId, new DateTime(2026, 5, 14), new TimeSpan(9, 0, 0), new TimeSpan(14, 0, 0), "Erev Shavuot"));

            await _db.DateExceptions.AddRangeAsync(exceptions);
            await _db.SaveChangesAsync();

            // 8. Generate Slots ────────────────────────────────────────────────
            int totalSlots = 0;
            foreach (var svcId in allServiceIds)
            {
                try
                {
                    var count = await _slotGen.GenerateSlotsForDateRangeAsync(svcId, slotStart, slotEnd);
                    totalSlots += count;
                    _logger.LogInformation("Generated {Count} slots for service {ServiceId}", count, svcId);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Slot generation failed for service {ServiceId}", svcId);
                }
            }

            _logger.LogInformation("Demo seed complete — {TotalSlots} slots across {ServiceCount} services.", totalSlots, allServiceIds.Length);
        }

        // ── Helpers ───────────────────────────────────────────────────────────

        private static BusinessPartner Partner(Guid businessId, Guid userId) => new()
        {
            BusinessId = businessId,
            UserId = userId,
            Status = InvitationStatus.Accepted,
            JoinedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        private static Service Svc(Guid id, Guid businessId, Guid userId, string name, int duration, decimal price, Guid categoryId, string? description = null) => new()
        {
            Id = id,
            BusinessId = businessId,
            UserId = userId,
            Name = name,
            Duration = duration,
            Price = price,
            CategoryId = categoryId,
            Description = description,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        private static WeeklyWorkingRule WorkDay(Guid serviceId, int dayOfWeek, TimeSpan start, TimeSpan end) => new()
        {
            Id = Guid.NewGuid(),
            ServiceId = serviceId,
            DayOfWeek = dayOfWeek,
            IsWorkingDay = true,
            StartTime = start,
            EndTime = end,
            CreatedAt = DateTime.UtcNow,
        };

        private static WeeklyWorkingRule ClosedDay(Guid serviceId, int dayOfWeek) => new()
        {
            Id = Guid.NewGuid(),
            ServiceId = serviceId,
            DayOfWeek = dayOfWeek,
            IsWorkingDay = false,
            StartTime = TimeSpan.Zero,
            EndTime = TimeSpan.Zero,
            CreatedAt = DateTime.UtcNow,
        };

        private static BreakRule Break(Guid serviceId, TimeSpan start, TimeSpan end) => new()
        {
            Id = Guid.NewGuid(),
            ServiceId = serviceId,
            DayOfWeek = null, // applies to all days
            StartTime = start,
            EndTime = end,
            CreatedAt = DateTime.UtcNow,
        };

        private static DateException ClosedDate(Guid serviceId, DateTime date, string reason) => new()
        {
            Id = Guid.NewGuid(),
            ServiceId = serviceId,
            Date = date,
            IsWorkingDay = false,
            Reason = reason,
            CreatedAt = DateTime.UtcNow,
        };

        private static DateException ShortDay(Guid serviceId, DateTime date, TimeSpan start, TimeSpan end, string reason) => new()
        {
            Id = Guid.NewGuid(),
            ServiceId = serviceId,
            Date = date,
            IsWorkingDay = true,
            StartTime = start,
            EndTime = end,
            Reason = reason,
            CreatedAt = DateTime.UtcNow,
        };

        private async Task RecalcCategories(Guid businessId, Guid[] serviceIds)
        {
            var business = await _db.Businesses.FindAsync(businessId);
            if (business == null) return;

            var categoryIds = await _db.Services
                .Where(s => serviceIds.Contains(s.Id) && s.CategoryId != Guid.Empty)
                .Select(s => s.CategoryId)
                .Distinct()
                .ToListAsync();

            business.CategoryIds = categoryIds.Select(g => g.ToString()).ToList();
            _db.Businesses.Update(business);
            await _db.SaveChangesAsync();
        }
    }
}
