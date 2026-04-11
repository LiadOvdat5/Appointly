import { useTranslation } from "react-i18next";
import { Button } from "../UI/Button";
import { Alert } from "../UI/Alert";
import { MaterialIcon } from "../UI/MaterialIcon";

interface Step3Props {
  businessName: string;
  onFinish: () => void;
}

export function Step3Complete({ businessName, onFinish }: Step3Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-6 text-center py-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
        <MaterialIcon name="check_circle" className="text-success text-[56px]!" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[#111418] dark:text-white">
          {t("onboarding.step3.title")}
        </h2>
        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
          {t("onboarding.step3.subtitle", { businessName })}
        </p>
      </div>

      <Alert variant="info" className="text-left">
        {t("onboarding.step3.scheduleAlert")}
      </Alert>

      <Button onClick={onFinish}>{t("onboarding.step3.goToDashboard")}</Button>
    </div>
  );
}
