import { useNavigate } from "react-router-dom";
import { ServiceCard } from "../components/UI/ServiceCard";
import { PillBadge } from "../components/UI/PillBadge";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { IMAGES } from "../assets/images";
import { MOCK_SERVICE_CATEGORIES } from "../constants/mockData";

/**
 * CustomerLandingPage - Landing page for customers
 * Features search, service categories, and quick booking
 */
const CustomerLandingPage = () => {
  const navigate = useNavigate();

  // Map mock data with corresponding images
  const services = MOCK_SERVICE_CATEGORIES.map((category) => ({
    image:
      IMAGES.categories[category.category as keyof typeof IMAGES.categories],
    title: category.title,
    subtitle: category.subtitle,
  }));

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
