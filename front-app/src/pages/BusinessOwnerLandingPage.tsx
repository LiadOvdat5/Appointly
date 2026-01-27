import { useNavigate } from "react-router-dom";
import { FeatureCard } from "../components/UI/FeatureCard";
import { StatCard } from "../components/UI/StatCard";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { IMAGES } from "../assets/images";
import {
  MOCK_BUSINESS_FEATURES,
  MOCK_BUSINESS_STATS,
  MOCK_TESTIMONIAL,
} from "../constants/mockData";

/**
 * BusinessOwnerLandingPage - Landing page for business owners
 * Showcases business management features, team coordination, and growth tools
 */
const BusinessOwnerLandingPage = () => {
  const navigate = useNavigate();

  // Map mock features data with icon components
  const features = MOCK_BUSINESS_FEATURES.map((feature) => ({
    icon: <MaterialIcon name={feature.iconName} className="!text-3xl" />,
    title: feature.title,
    description: feature.description,
    iconBgColor: feature.iconBgColor,
  }));

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 dark:bg-background-dark">
      <div className="@container">
        <div className="@[480px]:p-4">
          <div
            className="flex min-h-[520px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-2xl items-start justify-end px-6 pb-12"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.6) 100%), url("${IMAGES.businessOwner.heroBackground}")`,
            }}
          >
            <div className="flex flex-col gap-3 text-left">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold uppercase tracking-wider w-fit backdrop-blur-sm">
                Business Owner Edition
              </span>
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl">
                Transform your business scheduling
              </h1>
              <h2 className="text-white/90 text-base font-normal leading-relaxed @[480px]:text-lg">
                Automate bookings, manage your team, and scale your operations
                with the most intuitive platform for professionals.
              </h2>
            </div>
            <div className="flex flex-col w-full gap-3">
              <button
                onClick={() => navigate("/register")}
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 bg-[#1980e6] text-slate-50 text-base font-bold leading-normal tracking-[0.015em] shadow-lg hover:bg-[#1670cc] transition-colors"
              >
                <span className="truncate">Sign up now</span>
              </button>
              <p className="text-white/70 text-xs text-center">
                No credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-8">
        <StatCard
          label={MOCK_BUSINESS_STATS.label}
          value={MOCK_BUSINESS_STATS.value}
          description={MOCK_BUSINESS_STATS.description}
          icon={
            <MaterialIcon
              name={MOCK_BUSINESS_STATS.iconName}
              className={`${MOCK_BUSINESS_STATS.iconColor} !text-3xl`}
            />
          }
          iconBgColor={MOCK_BUSINESS_STATS.iconBgColor}
        />
      </div>

      <h2 className="text-[#0e141b] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-10">
        Scale your operations
      </h2>

      <div className="flex flex-col gap-4 p-4">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>

      <div className="px-4 pt-6 pb-10">
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url("${IMAGES.businessOwner.testimonialBackground}")`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
            <p className="text-white text-lg font-semibold italic">
              "{MOCK_TESTIMONIAL.quote}"
            </p>
            <p className="text-white/80 text-sm mt-2">
              — {MOCK_TESTIMONIAL.author}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessOwnerLandingPage;
