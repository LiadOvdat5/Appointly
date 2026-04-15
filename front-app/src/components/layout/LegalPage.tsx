import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface LegalSection {
  heading: string;
  body: string;
}

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalPage({ title, lastUpdated, sections }: LegalPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1 text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        aria-label={t("buttons.back", "Go back")}
      >
        <span className="material-symbols-outlined text-base" aria-hidden="true">
          arrow_back
        </span>
        {t("buttons.back", "Back")}
      </button>

      {/* Page heading */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {title}
      </h1>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-8">{lastUpdated}</p>

      {/* Sections */}
      <div className="flex flex-col gap-8">
        {sections.map((section, i) => (
          <section key={i} aria-labelledby={`legal-section-${i}`}>
            <h2
              id={`legal-section-${i}`}
              className="text-base font-semibold text-gray-900 dark:text-white mb-2"
            >
              {section.heading}
            </h2>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}

export default LegalPage;
