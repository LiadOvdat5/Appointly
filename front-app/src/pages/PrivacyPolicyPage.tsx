import { useTranslation } from "react-i18next";
import { LegalPage } from "../components/layout/LegalPage";

export function PrivacyPolicyPage() {
  const { t } = useTranslation();

  const sections = [
    { heading: t("privacy.intro.heading"), body: t("privacy.intro.body") },
    { heading: t("privacy.dataCollected.heading"), body: t("privacy.dataCollected.body") },
    { heading: t("privacy.howWeUse.heading"), body: t("privacy.howWeUse.body") },
    { heading: t("privacy.dataSharing.heading"), body: t("privacy.dataSharing.body") },
    { heading: t("privacy.dataRetention.heading"), body: t("privacy.dataRetention.body") },
    { heading: t("privacy.yourRights.heading"), body: t("privacy.yourRights.body") },
    { heading: t("privacy.cookies.heading"), body: t("privacy.cookies.body") },
    { heading: t("privacy.contact.heading"), body: t("privacy.contact.body") },
  ];

  return (
    <LegalPage
      title={t("privacy.title")}
      lastUpdated={t("privacy.lastUpdated")}
      sections={sections}
    />
  );
}

export default PrivacyPolicyPage;
