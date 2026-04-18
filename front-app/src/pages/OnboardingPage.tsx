import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "../redux/store";
import { setOwnedBusiness, setBusinessError } from "../features/business/businessSlice";
import { setSession } from "../redux/authSlice";
import { me } from "../api/auth";
import { createBusiness } from "../services/businessManagementService";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import type { Step, BusinessFields } from "../components/onboarding/onboardingTypes";
import { StepIndicator } from "../components/onboarding/StepIndicator";
import { Step1BusinessInfo } from "../components/onboarding/Step1BusinessInfo";
import { Step2AddServices } from "../components/onboarding/Step2AddServices";
import { Step3Complete } from "../components/onboarding/Step3Complete";
import { Tutorial, type TutorialStep } from "../components/UI/Tutorial/Tutorial";
import { useTutorial } from "../hooks/useTutorial";

const ONBOARDING_TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: "[data-tutorial='onboarding-header']",
    titleKey: "tutorials.onboarding.step1.title",
    bodyKey: "tutorials.onboarding.step1.body",
    placement: "bottom",
  },
  {
    target: "[data-tutorial='onboarding-step-indicator']",
    titleKey: "tutorials.onboarding.step2.title",
    bodyKey: "tutorials.onboarding.step2.body",
    placement: "bottom",
  },
  {
    target: "[data-tutorial='onboarding-step-indicator']",
    titleKey: "tutorials.onboarding.step3.title",
    bodyKey: "tutorials.onboarding.step3.body",
    placement: "bottom",
  },
  {
    target: "[data-tutorial='onboarding-card']",
    titleKey: "tutorials.onboarding.step4.title",
    bodyKey: "tutorials.onboarding.step4.body",
    placement: "top",
  },
  {
    target: "[data-tutorial='onboarding-card']",
    titleKey: "tutorials.onboarding.step5.title",
    bodyKey: "tutorials.onboarding.step5.body",
    placement: "top",
  },
];

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);
  const { isActive: tutorialActive, markSeen: markTutorialSeen } = useTutorial("onboarding");

  const [step, setStep] = useState<Step>(1);
  const [businessFields, setBusinessFields] = useState<BusinessFields>({
    name: "",
    address: "",
    latitude: null,
    longitude: null,
    phone: "",
    description: "",
    currency: "ILS",
  });
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Step 1 → create business → refresh session (role changes to Owner on backend) → move to step 2
  const handleStep1Next = async () => {
    setIsCreating(true);
    setCreateError(null);
    try {
      const business = await createBusiness({
        name: businessFields.name.trim(),
        address: businessFields.address.trim(),
        phone: businessFields.phone.trim(),
        description: businessFields.description.trim() || undefined,
        currency: businessFields.currency,
        latitude: businessFields.latitude ?? undefined,
        longitude: businessFields.longitude ?? undefined,
      });
      dispatch(setOwnedBusiness(business));
      setCreatedBusinessId(business.id);

      // Refresh session so Redux reflects the new Owner role
      try {
        const session = await me();
        dispatch(
          setSession({
            user: session.user,
            expiresAt: new Date(session.expiresAt).getTime(),
          }),
        );
      } catch {
        // Non-critical: business was created, session refresh failed
      }

      setStep(2);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t("onboarding.error.businessNameRequired");
      setCreateError(msg);
      dispatch(setBusinessError(msg));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex flex-col items-center justify-start py-10 px-4">
      {tutorialActive && (
        <Tutorial
          tutorialKey="onboarding"
          steps={ONBOARDING_TUTORIAL_STEPS}
          onComplete={markTutorialSeen}
          onSkip={markTutorialSeen}
        />
      )}
      <div className="w-full max-w-lg">
        {/* Header */}
        <div data-tutorial="onboarding-header" className="flex items-center gap-3 mb-6">
          <MaterialIcon name="store" className="text-primary text-[28px]!" />
          <h1 className="text-2xl font-black text-[#111418] dark:text-white">
            {t("onboarding.pageTitle")}
          </h1>
        </div>

        <div data-tutorial="onboarding-step-indicator">
          <StepIndicator current={step} />
        </div>

        <div data-tutorial="onboarding-card" className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          {step === 1 && (
            <Step1BusinessInfo
              fields={businessFields}
              onChange={setBusinessFields}
              onNext={handleStep1Next}
              isLoading={isCreating}
              error={createError}
            />
          )}

          {step === 2 && createdBusinessId && user && (
            <Step2AddServices
              businessId={createdBusinessId}
              ownerId={user.id}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <Step3Complete
              businessName={businessFields.name}
              onFinish={() => navigate("/dashboard")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
