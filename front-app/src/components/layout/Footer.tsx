import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BUG_REPORT_MAILTO, FEATURE_REQUEST_MAILTO } from "../../constants/contactInfo";

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400"
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-lg px-4 py-8">
        {/* Top section: columns */}
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              BizSlot
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-500 max-w-[18rem]">
              {t("footer.copyright", { year: currentYear })}
            </p>
          </div>

          {/* Contact & Feedback */}
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {t("footer.contact.title")}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {t("footer.contact.tagline")}
            </p>
            <a
              href={BUG_REPORT_MAILTO}
              aria-label={t("footer.contact.bugAriaLabel")}
              className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              {t("footer.contact.bugLabel")}
            </a>
            <a
              href={FEATURE_REQUEST_MAILTO}
              aria-label={t("footer.contact.featureAriaLabel")}
              className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              {t("footer.contact.featureLabel")}
            </a>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {t("footer.legal.title")}
            </h2>
            <Link
              to="/privacy"
              className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              {t("footer.legal.privacy")}
            </Link>
            <Link
              to="/terms"
              className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              {t("footer.legal.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
