import React, { useEffect, useReducer, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import {
  selectAvailabilityDate,
  selectAvailabilityTimeFrom,
  selectAvailabilityTimeTo,
} from "../features/search/searchSelectors";
import {
  getPublicBusinessById,
  getPublicServicesForBusiness,
  updateBusiness,
  createService,
  updateService,
  deleteService,
  uploadBusinessLogo,
  uploadBusinessBanner,
  uploadBusinessSearchImage,
} from "../services/businessManagementService";
import { fetchCategories } from "../services/categoryService";
import {
  getAvailableSlotsForService,
  type SlotDTO,
} from "../services/scheduleService";
import type { BusinessProfile, ServiceProfile } from "../types/business";
import type { Category } from "../types/search";
import { Button } from "../components/UI/Button";
import { Card } from "../components/UI/Card";
import { Input } from "../components/UI/Input";
import { Select } from "../components/UI/Select";
import { MaterialIcon } from "../components/UI/MaterialIcon";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL as string ?? "";

/** Resolve an API-relative upload path (e.g. /uploads/logos/foo.jpg) to a full URL */
function resolveUploadUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatSlotDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatSlotTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

// ─── State types ─────────────────────────────────────────────────────────────

type DraftBusiness = {
  name: string;
  description: string;
  address: string;
  phone: string;
  themeColor: string;
};

type DraftService = {
  name: string;
  description: string;
  duration: string;
  price: string;
  categoryId: string;
};

const emptyServiceDraft = (): DraftService => ({
  name: "",
  description: "",
  duration: "",
  price: "",
  categoryId: "",
});

type PageState =
  | { status: "loading" }
  | { status: "not_found" }
  | {
      status: "ready";
      business: BusinessProfile;
      services: ServiceProfile[];
      categories: Category[];
      slotsByService: Record<string, SlotDTO[]>;
      slotsLoadingFor: Set<string>;
      // Edit mode
      isEditing: boolean;
      draft: DraftBusiness;
      isSaving: boolean;
      saveError: string | null;
      // Image upload
      logoPreview: string | null;
      logoFile: File | null;
      bannerPreview: string | null;
      bannerFile: File | null;
      isUploadingLogo: boolean;
      isUploadingBanner: boolean;
      searchImagePreview: string | null;
      searchImageFile: File | null;
      isUploadingSearchImage: boolean;
      // Service editing
      editingServiceId: string | "new" | null;
      serviceDraft: DraftService;
      isServiceSaving: boolean;
      serviceError: string | null;
    };

type PageAction =
  | { type: "LOADED"; business: BusinessProfile; services: ServiceProfile[]; categories: Category[] }
  | { type: "NOT_FOUND" }
  | { type: "SLOTS_LOADING"; serviceId: string }
  | { type: "SLOTS_READY"; serviceId: string; slots: SlotDTO[] }
  | { type: "ENTER_EDIT" }
  | { type: "EXIT_EDIT" }
  | { type: "SET_DRAFT"; field: keyof DraftBusiness; value: string }
  | { type: "SET_SAVING"; value: boolean }
  | { type: "SET_SAVE_ERROR"; message: string | null }
  | { type: "SAVE_SUCCESS"; business: BusinessProfile }
  | { type: "SET_LOGO_PREVIEW"; preview: string | null; file: File | null }
  | { type: "SET_BANNER_PREVIEW"; preview: string | null; file: File | null }
  | { type: "SET_SEARCH_IMAGE_PREVIEW"; preview: string | null; file: File | null }
  | { type: "SET_UPLOADING_LOGO"; value: boolean }
  | { type: "SET_UPLOADING_BANNER"; value: boolean }
  | { type: "SET_UPLOADING_SEARCH_IMAGE"; value: boolean }
  | { type: "EDIT_SERVICE"; serviceId: string | "new"; draft?: DraftService }
  | { type: "CANCEL_SERVICE_EDIT" }
  | { type: "SET_SERVICE_DRAFT"; field: keyof DraftService; value: string }
  | { type: "SET_SERVICE_SAVING"; value: boolean }
  | { type: "SET_SERVICE_ERROR"; message: string | null }
  | { type: "SERVICE_SAVED"; service: ServiceProfile }
  | { type: "SERVICE_ADDED"; service: ServiceProfile }
  | { type: "SERVICE_DELETED"; serviceId: string };

function makeDraftFromBusiness(b: BusinessProfile): DraftBusiness {
  return {
    name: b.name,
    description: b.description ?? "",
    address: b.address ?? "",
    phone: b.phone ?? "",
    themeColor: b.themeColor ?? "#197fe6",
  };
}

function pageReducer(state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case "LOADED":
      return {
        status: "ready",
        business: action.business,
        services: action.services,
        categories: action.categories,
        slotsByService: {},
        slotsLoadingFor: new Set(action.services.map((s) => s.id)),
        isEditing: false,
        draft: makeDraftFromBusiness(action.business),
        isSaving: false,
        saveError: null,
        logoPreview: null,
        logoFile: null,
        bannerPreview: null,
        bannerFile: null,
        isUploadingLogo: false,
        isUploadingBanner: false,
        searchImagePreview: null,
        searchImageFile: null,
        isUploadingSearchImage: false,
        editingServiceId: null,
        serviceDraft: emptyServiceDraft(),
        isServiceSaving: false,
        serviceError: null,
      };

    case "NOT_FOUND":
      return { status: "not_found" };

    case "SLOTS_LOADING": {
      if (state.status !== "ready") return state;
      const next = new Set(state.slotsLoadingFor);
      next.add(action.serviceId);
      return { ...state, slotsLoadingFor: next };
    }

    case "SLOTS_READY": {
      if (state.status !== "ready") return state;
      const next = new Set(state.slotsLoadingFor);
      next.delete(action.serviceId);
      return {
        ...state,
        slotsByService: { ...state.slotsByService, [action.serviceId]: action.slots },
        slotsLoadingFor: next,
      };
    }

    case "ENTER_EDIT":
      if (state.status !== "ready") return state;
      return {
        ...state,
        isEditing: true,
        draft: makeDraftFromBusiness(state.business),
        saveError: null,
        logoPreview: null,
        logoFile: null,
        bannerPreview: null,
        bannerFile: null,
        searchImagePreview: null,
        searchImageFile: null,
        isUploadingSearchImage: false,
        editingServiceId: null,
        serviceDraft: emptyServiceDraft(),
        serviceError: null,
      };

    case "EXIT_EDIT":
      if (state.status !== "ready") return state;
      return {
        ...state,
        isEditing: false,
        isSaving: false,
        saveError: null,
        logoPreview: null,
        logoFile: null,
        bannerPreview: null,
        bannerFile: null,
        searchImagePreview: null,
        searchImageFile: null,
        isUploadingSearchImage: false,
        editingServiceId: null,
        serviceDraft: emptyServiceDraft(),
        serviceError: null,
      };

    case "SET_DRAFT":
      if (state.status !== "ready") return state;
      return { ...state, draft: { ...state.draft, [action.field]: action.value } };

    case "SET_SAVING":
      if (state.status !== "ready") return state;
      return { ...state, isSaving: action.value };

    case "SET_SAVE_ERROR":
      if (state.status !== "ready") return state;
      return { ...state, saveError: action.message, isSaving: false };

    case "SAVE_SUCCESS":
      if (state.status !== "ready") return state;
      return {
        ...state,
        business: action.business,
        isEditing: false,
        isSaving: false,
        saveError: null,
        logoPreview: null,
        logoFile: null,
        bannerPreview: null,
        bannerFile: null,
        searchImagePreview: null,
        searchImageFile: null,
        isUploadingSearchImage: false,
        editingServiceId: null,
        draft: makeDraftFromBusiness(action.business),
      };

    case "SET_LOGO_PREVIEW":
      if (state.status !== "ready") return state;
      return { ...state, logoPreview: action.preview, logoFile: action.file };

    case "SET_BANNER_PREVIEW":
      if (state.status !== "ready") return state;
      return { ...state, bannerPreview: action.preview, bannerFile: action.file };

    case "SET_UPLOADING_LOGO":
      if (state.status !== "ready") return state;
      return { ...state, isUploadingLogo: action.value };

    case "SET_UPLOADING_BANNER":
      if (state.status !== "ready") return state;
      return { ...state, isUploadingBanner: action.value };

    case "SET_SEARCH_IMAGE_PREVIEW":
      if (state.status !== "ready") return state;
      return { ...state, searchImagePreview: action.preview, searchImageFile: action.file };

    case "SET_UPLOADING_SEARCH_IMAGE":
      if (state.status !== "ready") return state;
      return { ...state, isUploadingSearchImage: action.value };

    case "EDIT_SERVICE":
      if (state.status !== "ready") return state;
      return {
        ...state,
        editingServiceId: action.serviceId,
        serviceDraft: action.draft ?? emptyServiceDraft(),
        serviceError: null,
      };

    case "CANCEL_SERVICE_EDIT":
      if (state.status !== "ready") return state;
      return { ...state, editingServiceId: null, serviceDraft: emptyServiceDraft(), serviceError: null };

    case "SET_SERVICE_DRAFT":
      if (state.status !== "ready") return state;
      return { ...state, serviceDraft: { ...state.serviceDraft, [action.field]: action.value } };

    case "SET_SERVICE_SAVING":
      if (state.status !== "ready") return state;
      return { ...state, isServiceSaving: action.value };

    case "SET_SERVICE_ERROR":
      if (state.status !== "ready") return state;
      return { ...state, serviceError: action.message, isServiceSaving: false };

    case "SERVICE_SAVED": {
      if (state.status !== "ready") return state;
      return {
        ...state,
        services: state.services.map((s) =>
          s.id === action.service.id ? action.service : s,
        ),
        editingServiceId: null,
        serviceDraft: emptyServiceDraft(),
        isServiceSaving: false,
        serviceError: null,
      };
    }

    case "SERVICE_ADDED":
      if (state.status !== "ready") return state;
      return {
        ...state,
        services: [...state.services, action.service],
        editingServiceId: null,
        serviceDraft: emptyServiceDraft(),
        isServiceSaving: false,
        serviceError: null,
      };

    case "SERVICE_DELETED":
      if (state.status !== "ready") return state;
      return {
        ...state,
        services: state.services.filter((s) => s.id !== action.serviceId),
      };

    default:
      return state;
  }
}

// ─── Service card (view mode) ─────────────────────────────────────────────────

function ServiceCardItem({
  service,
  businessId,
  slots,
  slotsLoading,
  isAuthenticated,
  isEditing,
  isBeingEdited,
  onEdit,
  onDelete,
  onManageSchedule,
}: {
  service: ServiceProfile;
  businessId: string;
  slots: SlotDTO[];
  slotsLoading: boolean;
  isAuthenticated: boolean;
  isEditing: boolean;
  isBeingEdited: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onManageSchedule: () => void;
}) {
  const navigate = useNavigate();
  const bookingPath = `/book/${businessId}/${service.id}`;
  const loginRedirect = `/login?from=/business/${businessId}`;

  function handleBook(extra = "") {
    if (!isAuthenticated) {
      navigate(loginRedirect);
    } else {
      navigate(extra ? `${bookingPath}${extra}` : bookingPath);
    }
  }

  const previewSlots = slots.slice(0, 3);

  return (
    <Card className={`p-5 flex flex-col gap-4 transition-opacity ${isBeingEdited ? "opacity-40 pointer-events-none" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-bold text-[#111418] dark:text-white text-base">
            {service.name}
          </p>
          {service.description && (
            <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
          )}
        </div>
        <div className="flex items-start gap-2">
          <div className="flex flex-col items-end gap-1 shrink-0">
            {service.price != null && (
              <span className="font-bold text-primary text-base">
                ${service.price.toFixed(2)}
              </span>
            )}
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <MaterialIcon name="schedule" className="text-sm leading-none" />
              {formatDuration(service.duration)}
            </span>
          </div>
          {isEditing && (
            <div className="flex items-center gap-1 ml-1">
              <button
                type="button"
                onClick={onManageSchedule}
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="Manage schedule"
              >
                <MaterialIcon name="calendar_month" className="text-base" />
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                aria-label="Edit service"
              >
                <MaterialIcon name="edit" className="text-base" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors"
                aria-label="Delete service"
              >
                <MaterialIcon name="delete" className="text-base" />
              </button>
            </div>
          )}
        </div>
      </div>

      {!isEditing && (
        <>
          <div>
            {slotsLoading ? (
              <p className="text-xs text-gray-400">Checking availability…</p>
            ) : previewSlots.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {previewSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() =>
                      handleBook(
                        `?slotId=${slot.id}&slotDate=${encodeURIComponent(slot.startDateTime)}`,
                      )
                    }
                    className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary
                      hover:bg-primary/10 active:scale-95 transition-all"
                  >
                    {formatSlotDate(slot.startDateTime)}{" "}
                    <span className="font-bold">{formatSlotTime(slot.startDateTime)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No upcoming slots available</p>
            )}
          </div>
          <Button variant="primary" size="sm" onClick={() => handleBook()}>
            Book
          </Button>
        </>
      )}
    </Card>
  );
}

// ─── Service edit / add form ─────────────────────────────────────────────────

function ServiceForm({
  draft,
  categories,
  isNew,
  isSaving,
  error,
  onField,
  onSave,
  onCancel,
}: {
  draft: DraftService;
  categories: Category[];
  isNew: boolean;
  isSaving: boolean;
  error: string | null;
  onField: (field: keyof DraftService, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const categoryOptions = [
    { value: "", label: "— Select category —" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const durationNum = Number(draft.duration);
  const priceNum = Number(draft.price);
  const durationError =
    draft.duration !== "" && (isNaN(durationNum) || durationNum <= 0)
      ? "Must be a positive number"
      : undefined;
  const priceError =
    draft.price !== "" && (isNaN(priceNum) || priceNum < 0)
      ? "Cannot be negative"
      : undefined;

  const canSave =
    draft.name.trim().length > 0 &&
    draft.duration !== "" &&
    !durationError &&
    !priceError &&
    (!isNew || draft.categoryId !== "");

  return (
    <Card className="p-5 flex flex-col gap-4 border-2 border-primary/30 bg-primary/5 dark:bg-primary/10">
      <p className="text-sm font-bold text-primary">
        {isNew ? "Add Service" : "Edit Service"}
      </p>

      <div className="grid grid-cols-1 gap-3">
        <Input
          label="Name"
          value={draft.name}
          onValueChange={(v) => onField("name", v)}
          placeholder="e.g. Haircut"
        />
        <Input
          label="Description (optional)"
          value={draft.description}
          onValueChange={(v) => onField("description", v)}
          placeholder="Short description"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Duration (min)"
            type="number"
            value={draft.duration}
            onValueChange={(v) => onField("duration", v)}
            placeholder="30"
            error={durationError}
          />
          <Input
            label="Price ($)"
            type="number"
            value={draft.price}
            onValueChange={(v) => onField("price", v)}
            placeholder="25.00"
            error={priceError}
          />
        </div>
        {isNew && (
          <Select
            label="Category"
            value={draft.categoryId}
            onChange={(v) => onField("categoryId", v)}
            options={categoryOptions}
          />
        )}
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          onClick={onSave}
          disabled={!canSave}
          isLoading={isSaving}
        >
          {isNew ? "Add Service" : "Save"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
      </div>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PublicBusinessPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const isAuthenticated = authStatus === "authenticated";

  // If the user arrived from a date/time availability search, scope slots to that window
  const searchAvailabilityDate = useSelector(selectAvailabilityDate);
  const searchAvailabilityTimeFrom = useSelector(selectAvailabilityTimeFrom);
  const searchAvailabilityTimeTo = useSelector(selectAvailabilityTimeTo);

  const [page, dispatch] = useReducer(pageReducer, { status: "loading" });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const searchImageInputRef = useRef<HTMLInputElement>(null);

  // Is the current user the owner?
  const isOwner =
    page.status === "ready" &&
    authUser != null &&
    authUser.id === page.business.ownerId;

  // ── Load business + services + categories ──────────────────────────────────
  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;

    Promise.all([
      getPublicBusinessById(businessId),
      getPublicServicesForBusiness(businessId),
      fetchCategories(),
    ])
      .then(([biz, svcs, cats]) => {
        if (!cancelled)
          dispatch({ type: "LOADED", business: biz, services: svcs, categories: cats });
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status === 404)
          dispatch({ type: "NOT_FOUND" });
      });

    return () => { cancelled = true; };
  }, [businessId]);

  // ── Auto-activate edit mode when ?edit=true ───────────────────────────────
  useEffect(() => {
    if (page.status === "ready" && searchParams.get("edit") === "true") {
      dispatch({ type: "ENTER_EDIT" });
    }
  }, [page.status, searchParams]);

  // ── Load slots once services are known ────────────────────────────────────
  // If the user arrived from an availability search, use that date/time window.
  // Otherwise default to the next 30 days.
  useEffect(() => {
    if (page.status !== "ready" || !page.services.length) return;

    let fromDate: Date;
    let toDate: Date;

    if (searchAvailabilityDate) {
      fromDate = new Date(
        `${searchAvailabilityDate}T${searchAvailabilityTimeFrom ?? "00:00"}:00`,
      );
      toDate = new Date(
        `${searchAvailabilityDate}T${searchAvailabilityTimeTo ?? "23:59"}:59`,
      );
    } else {
      fromDate = new Date();
      toDate = new Date();
      toDate.setDate(toDate.getDate() + 30);
    }

    let cancelled = false;

    page.services.forEach((svc) => {
      getAvailableSlotsForService(svc.id, fromDate, toDate)
        .then((slots) => {
          if (!cancelled) dispatch({ type: "SLOTS_READY", serviceId: svc.id, slots });
        })
        .catch(() => {
          if (!cancelled) dispatch({ type: "SLOTS_READY", serviceId: svc.id, slots: [] });
        });
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.status === "ready" ? page.services : null]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleSaveBusiness() {
    if (page.status !== "ready") return;
    dispatch({ type: "SET_SAVING", value: true });
    try {
      const updated = await updateBusiness(page.business.id, {
        name: page.draft.name,
        description: page.draft.description,
        address: page.draft.address,
        phone: page.draft.phone,
        themeColor: page.draft.themeColor,
      });
      dispatch({ type: "SAVE_SUCCESS", business: updated });
    } catch {
      dispatch({ type: "SET_SAVE_ERROR", message: "Failed to save. Please try again." });
    }
  }

  async function handleUploadLogo() {
    if (page.status !== "ready" || !page.logoFile) return;
    dispatch({ type: "SET_UPLOADING_LOGO", value: true });
    try {
      const updated = await uploadBusinessLogo(page.business.id, page.logoFile);
      dispatch({ type: "SAVE_SUCCESS", business: updated });
    } catch {
      dispatch({ type: "SET_UPLOADING_LOGO", value: false });
    }
  }

  async function handleUploadBanner() {
    if (page.status !== "ready" || !page.bannerFile) return;
    dispatch({ type: "SET_UPLOADING_BANNER", value: true });
    try {
      const updated = await uploadBusinessBanner(page.business.id, page.bannerFile);
      dispatch({ type: "SAVE_SUCCESS", business: updated });
    } catch {
      dispatch({ type: "SET_UPLOADING_BANNER", value: false });
    }
  }

  function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    dispatch({ type: "SET_LOGO_PREVIEW", preview, file });
  }

  function handleBannerFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    dispatch({ type: "SET_BANNER_PREVIEW", preview, file });
  }

  async function handleUploadSearchImage() {
    if (page.status !== "ready" || !page.searchImageFile) return;
    dispatch({ type: "SET_UPLOADING_SEARCH_IMAGE", value: true });
    try {
      const updated = await uploadBusinessSearchImage(page.business.id, page.searchImageFile);
      dispatch({ type: "SAVE_SUCCESS", business: updated });
    } catch {
      dispatch({ type: "SET_UPLOADING_SEARCH_IMAGE", value: false });
    }
  }

  function handleSearchImageFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    dispatch({ type: "SET_SEARCH_IMAGE_PREVIEW", preview, file });
  }

  function handleEditService(svc: ServiceProfile) {
    dispatch({
      type: "EDIT_SERVICE",
      serviceId: svc.id,
      draft: {
        name: svc.name,
        description: svc.description ?? "",
        duration: String(svc.duration),
        price: svc.price != null ? String(svc.price) : "",
        categoryId: svc.categoryId,
      },
    });
  }

  async function handleDeleteService(serviceId: string) {
    if (page.status !== "ready") return;
    try {
      await deleteService(page.business.id, serviceId);
      dispatch({ type: "SERVICE_DELETED", serviceId });
    } catch {
      // Silently ignore — could add a toast later
    }
  }

  async function handleSaveService() {
    if (page.status !== "ready" || page.editingServiceId === null) return;
    dispatch({ type: "SET_SERVICE_SAVING", value: true });

    try {
      if (page.editingServiceId === "new") {
        const added = await createService(page.business.id, {
          name: page.serviceDraft.name,
          description: page.serviceDraft.description || undefined,
          duration: parseInt(page.serviceDraft.duration, 10),
          price: page.serviceDraft.price ? parseFloat(page.serviceDraft.price) : undefined,
          categoryId: page.serviceDraft.categoryId,
          userId: authUser!.id,
        });
        dispatch({ type: "SERVICE_ADDED", service: added });
      } else {
        const updated = await updateService(
          page.business.id,
          page.editingServiceId,
          {
            name: page.serviceDraft.name || undefined,
            description: page.serviceDraft.description || undefined,
            duration: page.serviceDraft.duration
              ? parseInt(page.serviceDraft.duration, 10)
              : undefined,
            price: page.serviceDraft.price
              ? parseFloat(page.serviceDraft.price)
              : undefined,
          },
        );
        dispatch({ type: "SERVICE_SAVED", service: updated });
      }
    } catch {
      dispatch({ type: "SET_SERVICE_ERROR", message: "Failed to save service." });
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (page.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
      </div>
    );
  }

  if (page.status === "not_found") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <MaterialIcon name="storefront" className="text-5xl text-gray-300 dark:text-gray-700" />
        <h1 className="text-2xl font-bold text-[#111418] dark:text-white">
          Business not found
        </h1>
        <p className="text-gray-500">
          This business page doesn't exist or has been removed.
        </p>
        <Button variant="outline" size="sm" className="w-auto px-6" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  const {
    business,
    services,
    categories,
    slotsByService,
    slotsLoadingFor,
    isEditing,
    draft,
    isSaving,
    saveError,
    logoPreview,
    logoFile,
    bannerPreview,
    bannerFile,
    isUploadingLogo,
    isUploadingBanner,
    searchImagePreview,
    searchImageFile,
    isUploadingSearchImage,
    editingServiceId,
    serviceDraft,
    isServiceSaving,
    serviceError,
  } = page;

  // Apply live theme color via CSS custom property override on this page
  const activeThemeColor = isEditing ? draft.themeColor : (business.themeColor ?? undefined);
  const themeStyle: React.CSSProperties | undefined = activeThemeColor
    ? ({ "--color-primary": activeThemeColor } as React.CSSProperties)
    : undefined;

  // Displayed logo/banner/search-image (preview overrides persisted value in edit mode)
  const displayLogo = isEditing && logoPreview ? logoPreview : resolveUploadUrl(business.logoUrl);
  const displayBanner = isEditing && bannerPreview ? bannerPreview : resolveUploadUrl(business.bannerUrl);
  const displaySearchImage = isEditing && searchImagePreview ? searchImagePreview : resolveUploadUrl(business.searchImageUrl);

  return (
    <div style={themeStyle} className="min-h-screen bg-gray-50 dark:bg-background-dark">
      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-background-dark">
        <button
          type="button"
          onClick={() => (isEditing ? dispatch({ type: "EXIT_EDIT" }) : navigate(-1))}
          className="inline-flex items-center justify-center rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label={isEditing ? "Cancel edit" : "Back"}
        >
          <MaterialIcon
            name={isEditing ? "close" : "arrow_back"}
            className="text-[#111418] dark:text-white"
          />
        </button>
        <span className="flex-1 text-base font-bold text-[#111418] truncate dark:text-white">
          {isEditing ? "Editing: " + business.name : business.name}
        </span>
        {isOwner && !isEditing && (
          <button
            type="button"
            onClick={() => dispatch({ type: "ENTER_EDIT" })}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold
              text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <MaterialIcon name="edit" className="text-base" />
            Edit
          </button>
        )}
        {isEditing && (
          <Button
            variant="primary"
            size="sm"
            className="w-auto px-4"
            onClick={handleSaveBusiness}
            isLoading={isSaving}
          >
            Save
          </Button>
        )}
      </div>

      {/* ── Banner ── */}
      {(displayBanner || isEditing) && (
        <div className="relative w-full h-40 bg-primary/20 overflow-hidden">
          {displayBanner ? (
            <img
              src={displayBanner}
              alt="Business banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-primary/30 to-primary/10" />
          )}
          {isEditing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleBannerFileChange}
              />
              {bannerFile ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleUploadBanner}
                    disabled={isUploadingBanner}
                    className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#111418]
                      hover:bg-gray-100 disabled:opacity-50 transition-colors shadow"
                  >
                    {isUploadingBanner ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
                    ) : (
                      <MaterialIcon name="cloud_upload" className="text-base" />
                    )}
                    {isUploadingBanner ? "Uploading…" : "Upload banner"}
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "SET_BANNER_PREVIEW", preview: null, file: null })}
                    className="rounded-lg bg-white/80 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-white transition-colors shadow"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#111418]
                    hover:bg-gray-100 transition-colors shadow"
                >
                  <MaterialIcon name="add_photo_alternate" className="text-base" />
                  {displayBanner ? "Change banner" : "Add banner"}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mx-auto max-w-2xl px-4 pb-16 pt-6 flex flex-col gap-6">
        {/* ── Business header card ── */}
        <Card className="p-6 flex flex-col gap-4">
          {/* Logo + name row */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {displayLogo ? (
                <img
                  src={displayLogo}
                  alt="Business logo"
                  className="h-16 w-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MaterialIcon name="storefront" className="text-2xl text-primary" />
                </div>
              )}
              {isEditing && (
                <>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleLogoFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1 shadow-md
                      hover:brightness-95 transition-all"
                    aria-label="Change logo"
                  >
                    <MaterialIcon name="photo_camera" className="text-white text-xs" />
                  </button>
                </>
              )}
            </div>

            {isEditing ? (
              <div className="flex-1">
                <Input
                  value={draft.name}
                  onValueChange={(v) => dispatch({ type: "SET_DRAFT", field: "name", value: v })}
                  placeholder="Business name"
                />
              </div>
            ) : (
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[#111418] dark:text-white">
                  {business.name}
                </h1>
                {business.categories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {business.categories.map((cat) => (
                      <span
                        key={cat.id}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upload logo action strip (shown after file picked) */}
          {isEditing && logoFile && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
              <MaterialIcon name="image" className="text-primary text-base" />
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                {logoFile.name}
              </span>
              <button
                type="button"
                onClick={handleUploadLogo}
                disabled={isUploadingLogo}
                className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
              >
                {isUploadingLogo ? "Uploading…" : "Upload"}
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_LOGO_PREVIEW", preview: null, file: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <MaterialIcon name="close" className="text-base" />
              </button>
            </div>
          )}

          {/* Search Card Image (edit mode only) */}
          {isEditing && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#111418] dark:text-gray-200">
                Search Card Image
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Shown on search &amp; discovery pages. If not set, your logo is used instead.
              </p>
              <div className="flex items-center gap-3">
                {displaySearchImage ? (
                  <img
                    src={displaySearchImage}
                    alt="Search card preview"
                    className="h-20 w-32 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="h-20 w-32 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600">
                    <MaterialIcon name="image_search" className="text-2xl text-gray-400" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <input
                    ref={searchImageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleSearchImageFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => searchImageInputRef.current?.click()}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {displaySearchImage ? "Change image" : "Upload image"}
                  </button>
                  {displaySearchImage && !searchImageFile && (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: "SET_SEARCH_IMAGE_PREVIEW", preview: null, file: null })}
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              {searchImageFile && (
                <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
                  <MaterialIcon name="image" className="text-primary text-base" />
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                    {searchImageFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={handleUploadSearchImage}
                    disabled={isUploadingSearchImage}
                    className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                  >
                    {isUploadingSearchImage ? "Uploading…" : "Upload"}
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "SET_SEARCH_IMAGE_PREVIEW", preview: null, file: null })}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <MaterialIcon name="close" className="text-base" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {isEditing ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#111418] dark:text-gray-200">
                Description
              </label>
              <textarea
                value={draft.description}
                onChange={(e) =>
                  dispatch({ type: "SET_DRAFT", field: "description", value: e.target.value })
                }
                placeholder="Tell customers about your business…"
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-[#111418] outline-none
                  resize-none text-sm focus:ring-2 focus:ring-primary
                  dark:bg-gray-900 dark:text-white dark:border-gray-700"
              />
            </div>
          ) : (
            business.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {business.description}
              </p>
            )
          )}

          {/* Address + phone */}
          {isEditing ? (
            <div className="grid grid-cols-1 gap-3">
              <Input
                label="Address"
                value={draft.address}
                onValueChange={(v) => dispatch({ type: "SET_DRAFT", field: "address", value: v })}
                placeholder="123 Main St, City"
                startIcon={<MaterialIcon name="location_on" className="text-sm" />}
              />
              <Input
                label="Phone"
                type="tel"
                value={draft.phone}
                onValueChange={(v) => dispatch({ type: "SET_DRAFT", field: "phone", value: v })}
                placeholder="+1-555-0123"
                startIcon={<MaterialIcon name="call" className="text-sm" />}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {business.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MaterialIcon name="location_on" className="text-base text-gray-400" />
                  <span>{business.address}</span>
                </div>
              )}
              {business.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MaterialIcon name="call" className="text-base text-gray-400" />
                  <a href={`tel:${business.phone}`} className="hover:text-primary transition-colors">
                    {business.phone}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Theme color picker (edit mode only) */}
          {isEditing && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#111418] dark:text-gray-200">
                Theme Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={draft.themeColor}
                  onChange={(e) =>
                    dispatch({ type: "SET_DRAFT", field: "themeColor", value: e.target.value })
                  }
                  className="h-10 w-16 cursor-pointer rounded-lg border border-gray-300 bg-white p-1"
                />
                <span className="text-sm text-gray-500 font-mono">{draft.themeColor}</span>
                <span className="text-xs text-gray-400">
                  Live preview updates the page colors
                </span>
              </div>
            </div>
          )}

          {/* Save error */}
          {saveError && (
            <p className="text-sm text-danger">{saveError}</p>
          )}

          {/* Edit mode action bar (inside card) */}
          {isEditing && (
            <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={handleSaveBusiness}
                isLoading={isSaving}
              >
                Save changes
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => dispatch({ type: "EXIT_EDIT" })}
                disabled={isSaving}
              >
                Cancel
              </Button>
            </div>
          )}
        </Card>

        {/* ── Services section ── */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#111418] dark:text-white">Services</h2>
            {isEditing && editingServiceId !== "new" && (
              <button
                type="button"
                onClick={() => dispatch({ type: "EDIT_SERVICE", serviceId: "new" })}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                <MaterialIcon name="add" className="text-base" />
                Add service
              </button>
            )}
          </div>

          {services.length === 0 && !isEditing ? (
            <Card className="p-8 flex flex-col items-center gap-2 text-center">
              <MaterialIcon name="content_cut" className="text-4xl text-gray-300 dark:text-gray-700" />
              <p className="text-sm text-gray-500">
                This business hasn't listed any services yet.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {services.map((svc) =>
                isEditing && editingServiceId === svc.id ? (
                  <ServiceForm
                    key={svc.id}
                    draft={serviceDraft}
                    categories={categories}
                    isNew={false}
                    isSaving={isServiceSaving}
                    error={serviceError}
                    onField={(f, v) => dispatch({ type: "SET_SERVICE_DRAFT", field: f, value: v })}
                    onSave={handleSaveService}
                    onCancel={() => dispatch({ type: "CANCEL_SERVICE_EDIT" })}
                  />
                ) : (
                  <ServiceCardItem
                    key={svc.id}
                    service={svc}
                    businessId={businessId!}
                    slots={slotsByService[svc.id] ?? []}
                    slotsLoading={slotsLoadingFor.has(svc.id)}
                    isAuthenticated={isAuthenticated}
                    isEditing={isEditing}
                    isBeingEdited={isEditing && editingServiceId !== null && editingServiceId !== svc.id}
                    onEdit={() => handleEditService(svc)}
                    onDelete={() => handleDeleteService(svc.id)}
                    onManageSchedule={() => navigate(`/schedule/${businessId}/${svc.id}`)}
                  />
                ),
              )}

              {/* Add service form */}
              {isEditing && editingServiceId === "new" && (
                <ServiceForm
                  draft={serviceDraft}
                  categories={categories}
                  isNew
                  isSaving={isServiceSaving}
                  error={serviceError}
                  onField={(f, v) => dispatch({ type: "SET_SERVICE_DRAFT", field: f, value: v })}
                  onSave={handleSaveService}
                  onCancel={() => dispatch({ type: "CANCEL_SERVICE_EDIT" })}
                />
              )}

              {services.length === 0 && isEditing && editingServiceId !== "new" && (
                <Card className="p-6 flex flex-col items-center gap-2 text-center border-dashed">
                  <MaterialIcon name="content_cut" className="text-3xl text-gray-300 dark:text-gray-700" />
                  <p className="text-sm text-gray-500">No services yet. Add your first one above.</p>
                </Card>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
