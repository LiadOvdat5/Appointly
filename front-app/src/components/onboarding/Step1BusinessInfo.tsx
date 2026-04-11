import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "../UI/Input";
import { Button } from "../UI/Button";
import { Alert } from "../UI/Alert";
import { AddressAutocomplete } from "../UI/AddressAutocomplete";
import type { AddressResult } from "../UI/AddressAutocomplete";
import { AddressMapPreview } from "./AddressMapPreview";
import type { BusinessFields } from "./onboardingTypes";

interface Step1Props {
  fields: BusinessFields;
  onChange: (fields: BusinessFields) => void;
  onNext: () => void;
  isLoading: boolean;
  error: string | null;
}

export function Step1BusinessInfo({ fields, onChange, onNext, isLoading, error }: Step1Props) {
  const { t } = useTranslation();
  const [touched, setTouched] = useState<Partial<Record<keyof BusinessFields, boolean>>>({});

  const errors: Partial<Record<keyof BusinessFields, string>> = {
    name: !fields.name.trim() ? t("onboarding.error.businessNameRequired") : undefined,
    address: !fields.address.trim()
      ? t("onboarding.error.addressRequired")
      : fields.latitude == null
        ? t("onboarding.error.addressFromSuggestions")
        : undefined,
    phone: !fields.phone.trim() ? t("onboarding.error.phoneRequired") : undefined,
  };

  const isValid = !errors.name && !errors.address && !errors.phone;

  const handleSubmit = () => {
    setTouched({ name: true, address: true, phone: true });
    if (isValid) onNext();
  };

  const set = (key: keyof BusinessFields) => (val: string) => {
    onChange({ ...fields, [key]: val });
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleAddressSelect = (result: AddressResult) => {
    onChange({ ...fields, address: result.address, latitude: result.latitude, longitude: result.longitude });
    setTouched((prev) => ({ ...prev, address: true }));
  };

  const handleAddressTyping = (val: string) => {
    onChange({ ...fields, address: val, latitude: null, longitude: null });
    setTouched((prev) => ({ ...prev, address: true }));
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-[#111418] dark:text-white">
          {t("onboarding.step1.title")}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {t("onboarding.step1.subtitle")}
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Input
        label={t("onboarding.step1.businessNameLabel")}
        placeholder={t("onboarding.step1.businessNamePlaceholder")}
        value={fields.name}
        onValueChange={set("name")}
        error={touched.name ? errors.name : undefined}
      />

      <AddressAutocomplete
        label={t("onboarding.step1.addressLabel")}
        placeholder={t("onboarding.step1.addressPlaceholder")}
        value={fields.address}
        onAddressSelect={handleAddressSelect}
        onValueChange={handleAddressTyping}
        error={touched.address ? errors.address : undefined}
      />

      {fields.latitude != null && fields.longitude != null && (
        <AddressMapPreview latitude={fields.latitude} longitude={fields.longitude} />
      )}

      <Input
        label={t("onboarding.step1.phoneLabel")}
        type="tel"
        placeholder={t("onboarding.step1.phonePlaceholder")}
        value={fields.phone}
        onValueChange={set("phone")}
        error={touched.phone ? errors.phone : undefined}
      />

      <Input
        label={t("onboarding.step1.descriptionLabel")}
        placeholder={t("onboarding.step1.descriptionPlaceholder")}
        value={fields.description}
        onValueChange={set("description")}
      />

      <Button onClick={handleSubmit} isLoading={isLoading}>
        {t("buttons.next")}
      </Button>
    </div>
  );
}
