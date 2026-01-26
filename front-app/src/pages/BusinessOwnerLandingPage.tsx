import { useNavigate } from "react-router-dom";
import { FeatureCard } from "../components/UI/FeatureCard";
import { StatCard } from "../components/UI/StatCard";
import { MaterialIcon } from "../components/UI/MaterialIcon";

/**
 * BusinessOwnerLandingPage - Landing page for business owners
 * Showcases business management features, team coordination, and growth tools
 */
const BusinessOwnerLandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MaterialIcon name="calendar_month" className="!text-3xl" />,
      title: "Smart Availability",
      description:
        "Intelligent sync with your personal calendar and buffer times between sessions.",
      iconBgColor: "bg-blue-50 text-[#1980e6]",
    },
    {
      icon: <MaterialIcon name="group" className="!text-3xl" />,
      title: "Team Coordination",
      description:
        "Manage staff schedules, permissions, and performance metrics in one dashboard.",
      iconBgColor: "bg-purple-50 text-purple-600",
    },
    {
      icon: <MaterialIcon name="insights" className="!text-3xl" />,
      title: "Client Growth",
      description:
        "Built-in marketing tools and loyalty programs to keep your clients coming back.",
      iconBgColor: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-slate-50 dark:bg-background-dark">
      <div className="@container">
        <div className="@[480px]:p-4">
          <div
            className="flex min-h-[520px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-2xl items-start justify-end px-6 pb-12"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDNOLSapDQO3Ra98PspY5doe5KJ-sdNiYavW9TYa6vXpQZfvgxE4ce7to_13Pn9NYWR_QfHlTvjG5oK7iMxedp8yG1OfLGoJl22hLmfFeE3bzq_wVAwyJMN4MxYYK0vq1y1KcQ5PFWPuuPlQ4dQ2qe8r4CpxdEQYJ-AGzznUwzNwz_GiTKWkLUvN_4Ub5qwy6hQgyBbeORiISxyL710zKuNt0_dM1wnFJbBzBtGSarYlxBw2Bo47Q68YhlO4mXCZ3kJ6jNGDFxcgQ")',
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
          label="Business Impact"
          value="Save 10 hours/week"
          description="Average time saved on admin tasks"
          icon={
            <MaterialIcon
              name="trending_up"
              className="text-green-600 !text-3xl"
            />
          }
          iconBgColor="bg-green-100"
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
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDAez7ST3KGntoyQpUt3Je16G2cvuVC5XFaSRex-8VuX8_7AtNuRnCACZPkxZNmVfOjZi_QrLDqLgeF1Z6f6e5y7eREE79vpOVkfzZn5R594oI9IMHbJ4adZvqkAJoFsifQCtPpWl_1l2augxHcirBRYv_eZFTW1miI9KrvvaZpGHEE-ACJQKUY3augxgbE3bUkWGSc4NSAaN2_mVixdGNxV0snXpn3Gc0wcQB8D7-rFfNVvYdDw7pZuJnSJWe5U31pi1kC-QRvWQ")',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
            <p className="text-white text-lg font-semibold italic">
              "The transition was seamless. I finally feel back in control of my
              studio's growth."
            </p>
            <p className="text-white/80 text-sm mt-2">
              — Sarah J., Studio Owner
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessOwnerLandingPage;
