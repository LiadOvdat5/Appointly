import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../redux/hooks";
import {
  selectAuthStatus,
  selectIsAuthenticated,
  selectUser,
} from "../redux/authSelectors";
import { Role } from "../constants/roles";
import { HowItWorks } from "../components/UI/HowItWorks";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import CustomerHomePage from "./CustomerHomePage";
import OwnerHomePage from "./OwnerHomePage";

// ─── Sub-components ────────────────────────────────────────────────────────────

function FeatureBullet({ icon, text }: { icon: string; text: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
        <MaterialIcon name={icon} className="text-[#1980e6] text-base!" />
      </div>
      <span className="text-[#4e7397] dark:text-gray-400 text-sm">{text}</span>
    </li>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authStatus = useAppSelector(selectAuthStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  // Wait for auth bootstrap to finish
  if (authStatus === "unknown") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-background-dark">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
  }

  // Authenticated users — render role-specific home or redirect
  if (isAuthenticated && user) {
    if (user.role === Role.Owner) return <OwnerHomePage />;
    if (user.role === Role.Partner) return <Navigate to="/dashboard" replace />;
    if (user.role === Role.Admin) return <Navigate to="/admin" replace />;
    // Customer: render the personalised home screen inline
    return <CustomerHomePage />;
  }

  const customerSteps = [
    {
      iconName: "person_add",
      title: t("homePage.customers.steps.signUp.title"),
      description: t("homePage.customers.steps.signUp.description"),
    },
    {
      iconName: "search",
      title: t("homePage.customers.steps.search.title"),
      description: t("homePage.customers.steps.search.description"),
    },
    {
      iconName: "event_available",
      title: t("homePage.customers.steps.book.title"),
      description: t("homePage.customers.steps.book.description"),
    },
  ];

  const customerFeatures = [
    { icon: "category", text: t("homePage.customers.features.categories") },
    { icon: "map", text: t("homePage.customers.features.map") },
    { icon: "schedule", text: t("homePage.customers.features.slots") },
    { icon: "check_circle", text: t("homePage.customers.features.confirmation") },
  ];

  const ownerSteps = [
    {
      iconName: "person_add",
      title: t("homePage.owners.steps.signUp.title"),
      description: t("homePage.owners.steps.signUp.description"),
    },
    {
      iconName: "storefront",
      title: t("homePage.owners.steps.create.title"),
      description: t("homePage.owners.steps.create.description"),
    },
    {
      iconName: "build",
      title: t("homePage.owners.steps.services.title"),
      description: t("homePage.owners.steps.services.description"),
    },
    {
      iconName: "groups",
      title: t("homePage.owners.steps.launch.title"),
      description: t("homePage.owners.steps.launch.description"),
    },
  ];

  const ownerFeatures = [
    { icon: "web", text: t("homePage.owners.features.businessPage") },
    { icon: "price_change", text: t("homePage.owners.features.pricing") },
    { icon: "calendar_month", text: t("homePage.owners.features.schedule") },
    { icon: "bar_chart", text: t("homePage.owners.features.analytics") },
    { icon: "star", text: t("homePage.owners.features.reviews") },
  ];

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-background-dark min-h-screen">

      {/* ── Hero Section ─────────────────────────────────────────────────────── */}
      <section className="px-5 pt-14 pb-10 flex flex-col items-center text-center gap-5 bg-white dark:bg-gray-950 border-b border-[#e7edf3] dark:border-gray-800">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1980e6] shadow-lg shadow-blue-200 dark:shadow-none">
          <MaterialIcon name="event_available" className="text-white text-3xl!" />
        </div>

        <div className="flex flex-col gap-3 max-w-sm">
          <h1 className="text-[#0e141b] dark:text-white text-3xl font-black leading-tight tracking-tight">
            {t("homePage.hero.headline")}
          </h1>
          <p className="text-[#4e7397] dark:text-gray-400 text-base leading-relaxed">
            {t("homePage.hero.description")}
          </p>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-col w-full gap-3 max-w-sm pt-1">
          <button
            onClick={() => navigate("/search")}
            className="w-full flex items-center justify-center gap-2 rounded-xl h-13 bg-[#1980e6] text-white font-bold text-base shadow-md shadow-blue-200 hover:bg-[#1670cc] transition-colors"
          >
            <MaterialIcon name="search" className="text-lg!" />
            {t("homePage.hero.ctaFind")}
          </button>
          <button
            onClick={() => navigate("/register?role=BusinessOwner")}
            className="w-full flex items-center justify-center gap-2 rounded-xl h-13 bg-[#0e141b] dark:bg-gray-800 text-white font-bold text-base hover:bg-[#1a2535] transition-colors"
          >
            <MaterialIcon name="storefront" className="text-lg!" />
            {t("homePage.hero.ctaList")}
          </button>
        </div>

        <p className="text-xs text-[#4e7397] dark:text-gray-500 max-w-xs pt-2">
          {t("homePage.hero.alreadyHaveAccount")}{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-[#1980e6] font-semibold hover:underline"
          >
            {t("homePage.hero.logIn")}
          </button>
        </p>
      </section>

      {/* ── For Customers ────────────────────────────────────────────────────── */}
      <section className="px-5 pt-10 pb-8 flex flex-col gap-6 bg-slate-50 dark:bg-background-dark">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1980e6]">
            {t("homePage.customers.label")}
          </span>
          <h2 className="text-[#0e141b] dark:text-white text-2xl font-black leading-tight tracking-tight">
            {t("homePage.customers.title")}
          </h2>
          <p className="text-[#4e7397] dark:text-gray-400 text-sm leading-relaxed">
            {t("homePage.customers.subtitle")}
          </p>
        </div>

        <HowItWorks
          title={t("homePage.customers.howItWorksTitle")}
          steps={customerSteps}
        />

        <ul className="flex flex-col gap-3 px-1">
          {customerFeatures.map((f) => (
            <FeatureBullet key={f.icon} icon={f.icon} text={f.text} />
          ))}
        </ul>

        <button
          onClick={() => navigate("/register?role=Customer")}
          className="w-full flex items-center justify-center gap-2 rounded-xl h-12 border-2 border-[#1980e6] text-[#1980e6] font-bold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          {t("homePage.customers.cta")}
          <MaterialIcon name="arrow_forward" className="text-base!" />
        </button>
      </section>

      {/* ── Divider ──────────────────────────────────────────────────────────── */}
      <div className="h-px bg-[#e7edf3] dark:bg-gray-800 mx-5" />

      {/* ── For Business Owners ──────────────────────────────────────────────── */}
      <section className="px-5 pt-10 pb-14 flex flex-col gap-6 bg-slate-50 dark:bg-background-dark">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            {t("homePage.owners.label")}
          </span>
          <h2 className="text-[#0e141b] dark:text-white text-2xl font-black leading-tight tracking-tight">
            {t("homePage.owners.title")}
          </h2>
          <p className="text-[#4e7397] dark:text-gray-400 text-sm leading-relaxed">
            {t("homePage.owners.subtitle")}
          </p>
        </div>

        <HowItWorks
          title={t("homePage.owners.howItWorksTitle")}
          steps={ownerSteps}
        />

        <ul className="flex flex-col gap-3 px-1">
          {ownerFeatures.map((f) => (
            <FeatureBullet key={f.icon} icon={f.icon} text={f.text} />
          ))}
        </ul>

        <button
          onClick={() => navigate("/register?role=BusinessOwner")}
          className="w-full flex items-center justify-center gap-2 rounded-xl h-12 border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
        >
          {t("homePage.owners.cta")}
          <MaterialIcon name="arrow_forward" className="text-base!" />
        </button>
      </section>

    </div>
  );
};

export default HomePage;
