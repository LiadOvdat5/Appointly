import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { Role } from "../constants/roles";
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useSelector((s: RootState) => s.auth.user);
  const isClient = user?.role === Role.Client;

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
                {t("landing.customer.title")}
              </h2>
              <p className="text-[#4e7397] dark:text-gray-400 text-base font-medium">
                {t("landing.customer.subtitle")}
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <MaterialIcon name="search" className="text-slate-400" />
              </div>
              <input
                className="w-full bg-white dark:bg-gray-900 border-none rounded-2xl py-4 pl-10 pr-4 shadow-xl shadow-blue-100/50 dark:shadow-none text-base focus:ring-2 focus:ring-[#1980e6] placeholder:text-slate-400 dark:text-white"
                placeholder={t("landing.customer.searchPlaceholder")}
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
              {t("landing.customer.categories")}
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

        {isClient && (
          <div className="px-4 pb-10">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <MaterialIcon name="add_business" className="text-primary text-[26px]!" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#111418] dark:text-white text-sm">
                  Do you own a business?
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  List your services and start accepting bookings today.
                </p>
              </div>
              <button
                onClick={() => navigate("/onboarding")}
                className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:brightness-95 transition-all"
              >
                Get started
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerLandingPage;
