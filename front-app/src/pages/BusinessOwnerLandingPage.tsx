import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FeatureCard } from "../components/UI/FeatureCard";
import { StatCard } from "../components/UI/StatCard";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { HowItWorks } from "../components/UI/HowItWorks";
import { IMAGES } from "../assets/images";
import {
  MOCK_BUSINESS_FEATURES,
  MOCK_BUSINESS_STATS,
  MOCK_TESTIMONIAL,
  MOCK_HOW_IT_WORKS_STEPS,
} from "../constants/mockData";

/**
 * BusinessOwnerLandingPage - Landing page for business owners
 * Showcases business management features, team coordination, and growth tools
 * Text comes from i18n translations, visual data from mock data
 */
const BusinessOwnerLandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Feature keys that map to i18n translation keys
  const featureKeys = ["availability", "teamCoordination", "clientGrowth"];

  // Map mock features data with icon components and i18n translations
  const features = MOCK_BUSINESS_FEATURES.map((feature, index) => ({
    icon: <MaterialIcon name={feature.iconName} className="text-3xl!" />,
    title: t(`landing.owner.features.${featureKeys[index]}.title`),
    description: t(`landing.owner.features.${featureKeys[index]}.description`),
    iconBgColor: feature.iconBgColor,
  }));

  // Map how it works steps with icon components and i18n translations
  const stepKeys = ["setup", "availability", "grow"];
  const howItWorksSteps = MOCK_HOW_IT_WORKS_STEPS.map((step, index) => ({
    iconName: step.iconName,
    title: t(`landing.owner.howItWorks.${stepKeys[index]}.title`),
    description: t(`landing.owner.howItWorks.${stepKeys[index]}.description`),
  }));

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 dark:bg-background-dark">
      <div className="@container">
        <div className="@[480px]:p-4">
          <div
            className="flex min-h-130 flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-2xl items-start justify-end px-6 pb-12"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.6) 100%), url("${IMAGES.businessOwner.heroBackground}")`,
            }}
          >
            <div className="flex flex-col gap-3 text-left">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold uppercase tracking-wider w-fit backdrop-blur-sm">
                {t("landing.owner.edition")}
              </span>
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl">
                {t("landing.owner.title")}
              </h1>
              <h2 className="text-white/90 text-base font-normal leading-relaxed @[480px]:text-lg">
                {t("landing.owner.subtitle")}
              </h2>
            </div>
            <div className="flex flex-col w-full gap-3">
              <button
                onClick={() => navigate("/register")}
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 bg-[#1980e6] text-slate-50 text-base font-bold leading-normal tracking-[0.015em] shadow-lg hover:bg-[#1670cc] transition-colors"
              >
                <span className="truncate">
                  {t("landing.owner.signupButton")}
                </span>
              </button>
              <p className="text-white/70 text-xs text-center">
                {t("landing.owner.noCardRequired")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-8">
        <StatCard
          label={t("landing.owner.stats.label")}
          value={t("landing.owner.stats.value")}
          description={t("landing.owner.stats.description")}
          icon={
            <MaterialIcon
              name={MOCK_BUSINESS_STATS.iconName}
              className={`${MOCK_BUSINESS_STATS.iconColor} text-3xl!`}
            />
          }
          iconBgColor={MOCK_BUSINESS_STATS.iconBgColor}
        />
      </div>

      <HowItWorks
        steps={howItWorksSteps}
        title={t("landing.owner.howItWorks.title")}
      />

      <h2 className="text-[#0e141b] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-10">
        {t("landing.owner.scaleOperations")}
      </h2>

      <div className="flex flex-col gap-4 p-4">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>

      <div className="px-4 pt-6 pb-10">
        <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden shadow-sm">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url("${IMAGES.businessOwner.testimonialBackground}")`,
            }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
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
