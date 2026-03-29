import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { setOwnedBusiness, setBusinessError } from "../features/business/businessSlice";
import { setSession } from "../redux/authSlice";
import { me } from "../api/auth";
import { createBusiness, createService } from "../services/businessManagementService";
import { fetchCategories } from "../services/categoryService";
import { Input } from "../components/UI/Input";
import { Button } from "../components/UI/Button";
import { Select } from "../components/UI/Select";
import { Alert } from "../components/UI/Alert";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { AddressAutocomplete } from "../components/UI/AddressAutocomplete";
import type { AddressResult } from "../components/UI/AddressAutocomplete";
import type { Category } from "../types/search";
import type { CreateServiceInput } from "../types/business";

// ── Step types ──────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

interface BusinessFields {
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  description: string;
}

interface ServiceDraft {
  name: string;
  description: string;
  duration: string;
  price: string;
  categoryId: string;
}

const EMPTY_SERVICE: ServiceDraft = {
  name: "",
  description: "",
  duration: "",
  price: "",
  categoryId: "",
};

// ── Address map preview ──────────────────────────────────────────────────────

function AddressMapPreview({ latitude, longitude }: { latitude: number; longitude: number }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;

    const position = { lat: latitude, lng: longitude };

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: position,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: "cooperative",
      });
      markerRef.current = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
      });
    } else {
      mapInstanceRef.current.panTo(position);
      markerRef.current?.setPosition(position);
    }
  }, [latitude, longitude]);

  return (
    <div
      ref={mapRef}
      className="w-full h-44 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
    />
  );
}

// ── Stepper indicator ────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const steps: { label: string; icon: string }[] = [
    { label: "Business Info", icon: "store" },
    { label: "Services", icon: "design_services" },
    { label: "Done", icon: "check_circle" },
  ];

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => {
        const num = (i + 1) as Step;
        const done = current > num;
        const active = current === num;
        return (
          <div key={num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                  done
                    ? "bg-success text-white"
                    : active
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-400 dark:bg-gray-700",
                ].join(" ")}
              >
                {done ? (
                  <MaterialIcon name="check" className="text-[18px]!" />
                ) : (
                  <MaterialIcon name={s.icon} className="text-[18px]!" />
                )}
              </div>
              <span
                className={[
                  "text-[11px] font-medium whitespace-nowrap",
                  active
                    ? "text-primary"
                    : done
                      ? "text-success"
                      : "text-gray-400",
                ].join(" ")}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={[
                  "h-0.5 w-12 mb-5 mx-1 rounded transition-colors",
                  done ? "bg-success" : "bg-gray-200 dark:bg-gray-700",
                ].join(" ")}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Business Info ────────────────────────────────────────────────────

interface Step1Props {
  fields: BusinessFields;
  onChange: (fields: BusinessFields) => void;
  onNext: () => void;
  isLoading: boolean;
  error: string | null;
}

function Step1BusinessInfo({ fields, onChange, onNext, isLoading, error }: Step1Props) {
  const [touched, setTouched] = useState<Partial<Record<keyof BusinessFields, boolean>>>({});

  const errors: Partial<Record<keyof BusinessFields, string>> = {
    name: !fields.name.trim() ? "Business name is required." : undefined,
    address: !fields.address.trim()
      ? "Address is required."
      : fields.latitude == null
        ? "Please select an address from the suggestions."
        : undefined,
    phone: !fields.phone.trim() ? "Phone number is required." : undefined,
  };

  const isValid = !errors.name && !errors.address && !errors.phone;

  const handleSubmit = () => {
    setTouched({ name: true, address: true, phone: true });
    if (isValid) onNext();
  };

  const set = (key: keyof BusinessFields) => (val: string) => {
    onChange({ ...fields, [key]: val });
    setTouched((t) => ({ ...t, [key]: true }));
  };

  const handleAddressSelect = (result: AddressResult) => {
    onChange({ ...fields, address: result.address, latitude: result.latitude, longitude: result.longitude });
    setTouched((t) => ({ ...t, address: true }));
  };

  const handleAddressTyping = (val: string) => {
    // Clear coordinates when user edits text manually
    onChange({ ...fields, address: val, latitude: null, longitude: null });
    setTouched((t) => ({ ...t, address: true }));
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-[#111418] dark:text-white">
          Tell us about your business
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          This information will appear on your public business page.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Input
        label="Business name *"
        placeholder="e.g. John's Barbershop"
        value={fields.name}
        onValueChange={set("name")}
        error={touched.name ? errors.name : undefined}
      />

      <AddressAutocomplete
        label="Address *"
        placeholder="e.g. 123 Main St, Tel Aviv"
        value={fields.address}
        onAddressSelect={handleAddressSelect}
        onValueChange={handleAddressTyping}
        error={touched.address ? errors.address : undefined}
      />

      {fields.latitude != null && fields.longitude != null && (
        <AddressMapPreview latitude={fields.latitude} longitude={fields.longitude} />
      )}

      <Input
        label="Phone *"
        type="tel"
        placeholder="e.g. +972-50-0000000"
        value={fields.phone}
        onValueChange={set("phone")}
        error={touched.phone ? errors.phone : undefined}
      />

      <Input
        label="Description"
        placeholder="A short description of your business (optional)"
        value={fields.description}
        onValueChange={set("description")}
      />

      <Button onClick={handleSubmit} isLoading={isLoading}>
        Continue
      </Button>
    </div>
  );
}

// ── Step 2: Add Services ─────────────────────────────────────────────────────

interface Step2Props {
  businessId: string;
  ownerId: string;
  onNext: () => void;
  onBack: () => void;
}

function Step2AddServices({ businessId, ownerId, onNext, onBack }: Step2Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [draft, setDraft] = useState<ServiceDraft>(EMPTY_SERVICE);
  const [services, setServices] = useState<CreateServiceInput[]>([]);
  const [touched, setTouched] = useState<Partial<Record<keyof ServiceDraft, boolean>>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const errors: Partial<Record<keyof ServiceDraft, string>> = {
    name: !draft.name.trim() ? "Service name is required." : undefined,
    duration:
      !draft.duration || isNaN(Number(draft.duration)) || Number(draft.duration) <= 0
        ? "Duration must be a positive number (minutes)."
        : undefined,
    categoryId: !draft.categoryId ? "Category is required." : undefined,
  };

  const draftValid = !errors.name && !errors.duration && !errors.categoryId;

  const set = (key: keyof ServiceDraft) => (val: string) => {
    setDraft((d) => ({ ...d, [key]: val }));
    setTouched((t) => ({ ...t, [key]: true }));
  };

  const handleAddService = async () => {
    setTouched({ name: true, duration: true, categoryId: true });
    if (!draftValid) return;

    setIsAdding(true);
    setAddError(null);
    try {
      const input: CreateServiceInput = {
        name: draft.name.trim(),
        description: draft.description.trim() || undefined,
        duration: Number(draft.duration),
        price: draft.price ? Number(draft.price) : undefined,
        categoryId: draft.categoryId,
        userId: ownerId,
      };
      await createService(businessId, input);
      setServices((prev) => [...prev, input]);
      setDraft(EMPTY_SERVICE);
      setTouched({});
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to add service.";
      setAddError(msg);
    } finally {
      setIsAdding(false);
    }
  };

  const categoryOptions = [
    { value: "", label: "Select a category..." },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-[#111418] dark:text-white">
          Add your services
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Add at least one service. You can add more later from your dashboard.
        </p>
      </div>

      {/* Added services list */}
      {services.length > 0 && (
        <div className="flex flex-col gap-2">
          {services.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 px-3 py-2"
            >
              <MaterialIcon name="check_circle" className="text-success text-[18px]!" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111418] dark:text-white truncate">
                  {s.name}
                </p>
                <p className="text-xs text-gray-500">
                  {s.duration} min{s.price != null ? ` · ₪${s.price}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service draft form */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <p className="text-sm font-semibold text-[#111418] dark:text-white">
          {services.length === 0 ? "New service" : "Add another service"}
        </p>

        {addError && <Alert variant="error">{addError}</Alert>}

        <Input
          label="Service name *"
          placeholder="e.g. Haircut"
          value={draft.name}
          onValueChange={set("name")}
          error={touched.name ? errors.name : undefined}
        />

        <Input
          label="Description"
          placeholder="e.g. Classic haircut with wash and dry"
          value={draft.description}
          onValueChange={set("description")}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Duration (min) *"
            type="number"
            placeholder="e.g. 30"
            value={draft.duration}
            onValueChange={set("duration")}
            error={touched.duration ? errors.duration : undefined}
          />
          <Input
            label="Price (₪)"
            type="number"
            placeholder="e.g. 80"
            value={draft.price}
            onValueChange={set("price")}
          />
        </div>

        <Select
          label="Category *"
          value={draft.categoryId}
          onChange={set("categoryId")}
          options={categoryOptions}
        />
        {touched.categoryId && errors.categoryId && (
          <p className="text-xs text-danger -mt-2">{errors.categoryId}</p>
        )}

        <Button variant="secondary" onClick={handleAddService} isLoading={isAdding}>
          <MaterialIcon name="add" className="text-[18px]!" />
          Add service
        </Button>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={services.length === 0}
          className="flex-1"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

// ── Step 3: Complete ─────────────────────────────────────────────────────────

interface Step3Props {
  businessName: string;
  onFinish: () => void;
}

function Step3Complete({ businessName, onFinish }: Step3Props) {
  return (
    <div className="flex flex-col items-center gap-6 text-center py-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
        <MaterialIcon name="check_circle" className="text-success text-[56px]!" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[#111418] dark:text-white">
          You're all set!
        </h2>
        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
          <strong>{businessName}</strong> has been created successfully.
          Your services are live and customers can start booking.
        </p>
      </div>

      <Alert variant="info" className="text-left">
        Want to set up your working hours? Head to your dashboard to configure
        your schedule and availability.
      </Alert>

      <Button onClick={onFinish}>Go to Dashboard</Button>
    </div>
  );
}

// ── Main OnboardingPage ──────────────────────────────────────────────────────

export default function OnboardingPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);

  const [step, setStep] = useState<Step>(1);
  const [businessFields, setBusinessFields] = useState<BusinessFields>({
    name: "",
    address: "",
    latitude: null,
    longitude: null,
    phone: "",
    description: "",
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
      const msg = e instanceof Error ? e.message : "Failed to create business.";
      setCreateError(msg);
      dispatch(setBusinessError(msg));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark flex flex-col items-center justify-start py-10 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <MaterialIcon name="store" className="text-primary text-[28px]!" />
          <h1 className="text-2xl font-black text-[#111418] dark:text-white">
            Set up your business
          </h1>
        </div>

        <StepIndicator current={step} />

        <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 p-6">
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
