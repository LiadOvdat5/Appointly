import { useTranslation } from "react-i18next";
import { LegalPage } from "../components/layout/LegalPage";

export function TermsOfServicePage() {
  const { t } = useTranslation();

  const sections = [
    { heading: t("terms.acceptance.heading"), body: t("terms.acceptance.body") },
    { heading: t("terms.description.heading"), body: t("terms.description.body") },
    { heading: t("terms.accounts.heading"), body: t("terms.accounts.body") },
    { heading: t("terms.ownerResponsibilities.heading"), body: t("terms.ownerResponsibilities.body") },
    { heading: t("terms.customerResponsibilities.heading"), body: t("terms.customerResponsibilities.body") },
    { heading: t("terms.prohibitedConduct.heading"), body: t("terms.prohibitedConduct.body") },
    { heading: t("terms.ip.heading"), body: t("terms.ip.body") },
    { heading: t("terms.liability.heading"), body: t("terms.liability.body") },
    { heading: t("terms.termination.heading"), body: t("terms.termination.body") },
    { heading: t("terms.changes.heading"), body: t("terms.changes.body") },
    { heading: t("terms.contact.heading"), body: t("terms.contact.body") },
  ];

  return (
    <LegalPage
      title={t("terms.title")}
      lastUpdated={t("terms.lastUpdated")}
      sections={sections}
    />
  );
}

export default TermsOfServicePage;
