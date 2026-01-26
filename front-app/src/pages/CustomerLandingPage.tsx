import { useNavigate } from "react-router-dom";
import { ServiceCard } from "../components/UI/ServiceCard";
import { PillBadge } from "../components/UI/PillBadge";
import { MaterialIcon } from "../components/UI/MaterialIcon";

/**
 * CustomerLandingPage - Landing page for customers
 * Features search, service categories, and quick booking
 */
const CustomerLandingPage = () => {
  const navigate = useNavigate();

  const services = [
    {
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDAez7ST3KGntoyQpUt3Je16G2cvuVC5XFaSRex-8VuX8_7AtNuRnCACZPkxZNmVfOjZi_QrLDqLgeF1Z6f6e5y7eREE79vpOVkfzZn5R594oI9IMHbJ4adZvqkAJoFsifQCtPpWl_1l2augxHcirBRYv_eZFTW1miI9KrvvaZpGHEE-ACJQKUY3augxgbE3bUkWGSc4NSAaN2_mVixdGNxV0snXpn3Gc0wcQB8D7-rFfNVvYdDw7pZuJnSJWe5U31pi1kC-QRvWQ",
      title: "Barbershops",
      subtitle: "120+ Nearby",
    },
    {
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBet0ZpTVwjFnBIK50iBJq4j4sR3rYLzcBijna-J4LZI4xdq3iKjC27bTW-O7yb97ZT2Cq3ABfAbxZWAJMbiaC4BvVSf6rSDh8DV7B0GP3LwmtM9gvWyObR_bY9_CSCL_LQ9QhufFHsLr_7g-ieZs7GkhgeREosDLvjjkM23kI6uhHe8oTll_XQQsGdrI4uhFNxbPfbtng3dLtOuV_7ajhI7fdi-5jN5xvr_22cXeJ_3bxtHybk507jAicZ-R4f_LZB5OVYGfnE4Q",
      title: "Medical Clinics",
      subtitle: "45+ Nearby",
    },
    {
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD-l0DrJlK7DjaZcNNJBz0_LADbg1tHjsUeJ0a0i5-rI8L7dkcccaMlS4ELPpJvzB_9AonxsV51KBaUU7BWJuWmV_Za0E9oQcuDlhXm6Ouhpb1NZ8PWh-RUK9QqsrtPu_035_KHB97c1OP0A_eWwQ6SFDYVisrW9eAzlvWSvLUmA_Sh6zkrDOjvEWcVs9o-y4nf7xtkg4JGU3kvHrmpzvx_nB6eogMJ9yjjn0gRRl0AuOSPlZSRtaZpvDdziwVa1EKPHpYmsOMi_w",
      title: "Gyms & Studios",
      subtitle: "80+ Nearby",
    },
    {
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDNOLSapDQO3Ra98PspY5doe5KJ-sdNiYavW9TYa6vXpQZfvgxE4ce7to_13Pn9NYWR_QfHlTvjG5oK7iMxedp8yG1OfLGoJl22hLmfFeE3bzq_wVAwyJMN4MxYYK0vq1y1KcQ5PFWPuuPlQ4dQ2qe8r4CpxdEQYJ-AGzznUwzNwz_GiTKWkLUvN_4Ub5qwy6hQgyBbeORiISxyL710zKuNt0_dM1wnFJbBzBtGSarYlxBw2Bo47Q68YhlO4mXCZ3kJ6jNGDFxcgQ",
      title: "Beauty Salons",
      subtitle: "200+ Nearby",
    },
  ];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 dark:bg-background-dark">
      <div className="flex-1">
        <div className="px-4 pt-6 pb-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-[#0e141b] dark:text-white text-3xl font-black leading-tight tracking-tight">
                Find and book the best local services
              </h2>
              <p className="text-[#4e7397] dark:text-gray-400 text-base font-medium">
                The easiest way to schedule your life. Verified pros at your
                fingertips.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <MaterialIcon name="search" className="text-slate-400" />
              </div>
              <input
                className="w-full bg-white dark:bg-gray-900 border-none rounded-2xl py-4 pl-10 pr-4 shadow-xl shadow-blue-100/50 dark:shadow-none text-base focus:ring-2 focus:ring-[#1980e6] placeholder:text-slate-400 dark:text-white"
                placeholder="Barber, Dentist, Yoga..."
                type="text"
                onKeyDown={(e) => {
                  if (e.key === "Enter") navigate("/search");
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-4 pb-6 scrollbar-hide">
          <PillBadge
            icon={
              <MaterialIcon
                name="verified"
                className="text-lg text-[#1980e6]"
              />
            }
            label="Verified Pros"
            variant="blue"
          />
          <PillBadge
            icon={
              <MaterialIcon
                name="ads_click"
                className="text-lg text-green-600"
              />
            }
            label="3-click Booking"
            variant="green"
          />
          <PillBadge
            icon={
              <MaterialIcon
                name="calendar_today"
                className="text-lg text-purple-600"
              />
            }
            label="Manage Schedule"
            variant="purple"
          />
        </div>

        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#0e141b] dark:text-white text-lg font-bold">
              Explore Services
            </h3>
            <button
              onClick={() => navigate("/search")}
              className="text-[#1980e6] text-sm font-bold hover:underline"
            >
              See all
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                image={service.image}
                title={service.title}
                subtitle={service.subtitle}
                onClick={() => navigate("/search")}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          <button
            onClick={() => navigate("/search")}
            className="w-full bg-[#1980e6] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:bg-[#1670cc] transition-colors"
          >
            Explore Services
            <MaterialIcon name="arrow_forward" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerLandingPage;
