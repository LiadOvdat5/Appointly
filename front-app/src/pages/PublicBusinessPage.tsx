import React, { useEffect, useReducer, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
  getPublicBusinessBySlug,
  getPublicServicesForBusiness,
  updateBusiness,
  createService,
  updateService,
  deleteService,
  uploadBusinessLogo,
  uploadBusinessBanner,
  uploadBusinessSearchImage,
} from "../services/businessManagementService";
import {
  followBusiness,
  unfollowBusiness,
  getFollowStatus,
  getFollowerCount,
} from "../services/followService";
import { getBusinessReviews, type ReviewDTO } from "../services/reviewService";
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
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { AddressAutocomplete } from "../components/UI/AddressAutocomplete";
import type { AddressResult } from "../components/UI/AddressAutocomplete";
import { ShareModal } from "../components/UI/ShareModal";
import { meetsAALarge } from "../utils/colorContrast";
import { ServiceCard } from "../components/business/ServiceCard";
import { ServiceFormFields, emptyServiceDraft, type DraftService } from "../components/business/ServiceFormFields";
import { BusinessReviewsSection } from "../components/business/BusinessReviewsSection";
import { Tutorial, type TutorialStep } from "../components/UI/Tutorial/Tutorial";
import { useTutorial } from "../hooks/useTutorial";

const BUSINESS_EDIT_TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: "[data-tutorial='business-edit-header']",
    titleKey: "tutorials.business-edit.step1.title",
    bodyKey: "tutorials.business-edit.step1.body",
    placement: "bottom",
  },
  {
    target: "[data-tutorial='business-edit-images']",
    titleKey: "tutorials.business-edit.step2.title",
    bodyKey: "tutorials.business-edit.step2.body",
    placement: "bottom",
  },
  {
    target: "[data-tutorial='business-edit-theme']",
    titleKey: "tutorials.business-edit.step3.title",
    bodyKey: "tutorials.business-edit.step3.body",
    placement: "top",
  },
  {
    target: "[data-tutorial='business-edit-services']",
    titleKey: "tutorials.business-edit.step4.title",
    bodyKey: "tutorials.business-edit.step4.body",
    placement: "top",
  },
  {
    target: "[data-tutorial='business-edit-header']",
    titleKey: "tutorials.business-edit.step5.title",
    bodyKey: "tutorials.business-edit.step5.body",
    placement: "bottom",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? "";

/** Resolve an API-relative upload path (e.g. /uploads/logos/foo.jpg) to a full URL */
function resolveUploadUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

// ─── State types ─────────────────────────────────────────────────────────────

type DraftBusiness = {
  name: string;
  description: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  themeColor: string;
};

type PageState =
  | { status: "loading" }
  | { status: "not_found" }
  | { status: "suspended" }
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
  | {
      type: "LOADED";
      business: BusinessProfile;
      services: ServiceProfile[];
      categories: Category[];
    }
  | { type: "NOT_FOUND" }
  | { type: "SUSPENDED" }
  | { type: "SLOTS_LOADING"; serviceId: string }
  | { type: "SLOTS_READY"; serviceId: string; slots: SlotDTO[] }
  | { type: "ENTER_EDIT" }
  | { type: "EXIT_EDIT" }
  | { type: "SET_DRAFT"; field: keyof DraftBusiness; value: string }
  | {
      type: "SET_DRAFT_ADDRESS";
      address: string;
      latitude: number | null;
      longitude: number | null;
    }
  | { type: "SET_SAVING"; value: boolean }
  | { type: "SET_SAVE_ERROR"; message: string | null }
  | { type: "SAVE_SUCCESS"; business: BusinessProfile }
  | { type: "SET_LOGO_PREVIEW"; preview: string | null; file: File | null }
  | { type: "SET_BANNER_PREVIEW"; preview: string | null; file: File | null }
  | {
      type: "SET_SEARCH_IMAGE_PREVIEW";
      preview: string | null;
      file: File | null;
    }
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
    latitude: b.latitude ?? null,
    longitude: b.longitude ?? null,
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

    case "SUSPENDED":
      return { status: "suspended" };

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
        slotsByService: {
          ...state.slotsByService,
          [action.serviceId]: action.slots,
        },
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
      return {
        ...state,
        draft: { ...state.draft, [action.field]: action.value },
      };

    case "SET_DRAFT_ADDRESS":
      if (state.status !== "ready") return state;
      return {
        ...state,
        draft: {
          ...state.draft,
          address: action.address,
          latitude: action.latitude,
          longitude: action.longitude,
        },
      };

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
      return {
        ...state,
        bannerPreview: action.preview,
        bannerFile: action.file,
      };

    case "SET_UPLOADING_LOGO":
      if (state.status !== "ready") return state;
      return { ...state, isUploadingLogo: action.value };

    case "SET_UPLOADING_BANNER":
      if (state.status !== "ready") return state;
      return { ...state, isUploadingBanner: action.value };

    case "SET_SEARCH_IMAGE_PREVIEW":
      if (state.status !== "ready") return state;
      return {
        ...state,
        searchImagePreview: action.preview,
        searchImageFile: action.file,
      };

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
      return {
        ...state,
        editingServiceId: null,
        serviceDraft: emptyServiceDraft(),
        serviceError: null,
      };

    case "SET_SERVICE_DRAFT":
      if (state.status !== "ready") return state;
      return {
        ...state,
        serviceDraft: { ...state.serviceDraft, [action.field]: action.value },
      };

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

// ─── Main Page ────────────────────────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function PublicBusinessPage() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
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

  // Derive UUID and slug from loaded business (used for API calls and navigation)
  const businessId = page.status === "ready" ? page.business.id : undefined;
  const businessSlug = page.status === "ready" ? page.business.slug : slug;

  // Is the current user the owner?
  const isOwner =
    page.status === "ready" &&
    authUser != null &&
    authUser.id === page.business.ownerId;

  const { isActive: editTutorialActive, markSeen: markEditTutorialSeen } = useTutorial("business-edit");

  // ── Follow state ──────────────────────────────────────────────────────────
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState<number | null>(null);

  // ── Share modal ───────────────────────────────────────────────────────────
  const [isShareOpen, setIsShareOpen] = useState(false);

  // ── Reviews state ─────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsHasMore, setReviewsHasMore] = useState(false);
  const REVIEWS_PAGE_SIZE = 10;

  // ── Load business + services + categories ──────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    const isUUID = UUID_REGEX.test(slug);

    const loadBusiness = async () => {
      let biz;
      if (isUUID) {
        // Legacy UUID URL — fetch by ID then redirect to slug URL
        biz = await getPublicBusinessById(slug);
        if (!cancelled && biz.slug) {
          navigate(`/business/${biz.slug}`, { replace: true });
          return;
        }
      } else {
        biz = await getPublicBusinessBySlug(slug);
      }

      const [svcs, cats] = await Promise.all([
        getPublicServicesForBusiness(biz.id),
        fetchCategories(),
      ]);

      if (!cancelled)
        dispatch({ type: "LOADED", business: biz, services: svcs, categories: cats });
    };

    loadBusiness().catch((err) => {
      if (cancelled) return;
      if (err?.response?.status === 404) dispatch({ type: "NOT_FOUND" });
      else if (err?.response?.status === 503 || err?.response?.status === 410) dispatch({ type: "SUSPENDED" });
    });

    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  // ── Load follow status once business is ready ────────────────────────────
  useEffect(() => {
    if (page.status !== "ready" || !isAuthenticated || isOwner || !businessId)
      return;
    let cancelled = false;
    getFollowStatus(businessId)
      .then((s) => {
        if (!cancelled) setIsFollowing(s.isFollowing);
      })
      .catch(() => {
        /* silently ignore — user may not be authenticated */
      });
    return () => {
      cancelled = true;
    };
  }, [page.status, isAuthenticated, isOwner, businessId]);

  // ── Load follower count (public — visible to all) ─────────────────────────
  useEffect(() => {
    if (page.status !== "ready" || !businessId) return;
    let cancelled = false;
    getFollowerCount(businessId)
      .then((count) => {
        if (!cancelled) setFollowerCount(count);
      })
      .catch(() => {
        /* silently ignore */
      });
    return () => {
      cancelled = true;
    };
  }, [page.status, businessId]);

  // ── Load reviews (page 1) when business is ready ─────────────────────────
  useEffect(() => {
    if (!businessId) return;
    setReviewsLoading(true);
    setReviewsPage(1);
    getBusinessReviews(businessId, 1, REVIEWS_PAGE_SIZE)
      .then((data) => {
        setReviews(data);
        setReviewsHasMore(data.length === REVIEWS_PAGE_SIZE);
      })
      .catch(() => {
        /* silently ignore */
      })
      .finally(() => setReviewsLoading(false));
  }, [businessId]);

  async function handleLoadMoreReviews() {
    if (!businessId || reviewsLoading) return;
    const nextPage = reviewsPage + 1;
    setReviewsLoading(true);
    try {
      const data = await getBusinessReviews(
        businessId,
        nextPage,
        REVIEWS_PAGE_SIZE,
      );
      setReviews((prev) => [...prev, ...data]);
      setReviewsPage(nextPage);
      setReviewsHasMore(data.length === REVIEWS_PAGE_SIZE);
    } catch {
      /* silently ignore */
    } finally {
      setReviewsLoading(false);
    }
  }

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
          if (!cancelled)
            dispatch({ type: "SLOTS_READY", serviceId: svc.id, slots });
        })
        .catch(() => {
          if (!cancelled)
            dispatch({ type: "SLOTS_READY", serviceId: svc.id, slots: [] });
        });
    });

    return () => {
      cancelled = true;
    };
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
        latitude: page.draft.latitude ?? undefined,
        longitude: page.draft.longitude ?? undefined,
      });
      dispatch({ type: "SAVE_SUCCESS", business: updated });
    } catch {
      dispatch({
        type: "SET_SAVE_ERROR",
        message: t("publicBusiness.saveFailed"),
      });
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
      const updated = await uploadBusinessBanner(
        page.business.id,
        page.bannerFile,
      );
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
      const updated = await uploadBusinessSearchImage(
        page.business.id,
        page.searchImageFile,
      );
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
          price: page.serviceDraft.price
            ? parseFloat(page.serviceDraft.price)
            : undefined,
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
      dispatch({
        type: "SET_SERVICE_ERROR",
        message: t("publicBusiness.serviceFormSaveFailed"),
      });
    }
  }

  async function handleFollowToggle() {
    if (!businessId || isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowBusiness(businessId);
        setIsFollowing(false);
        setFollowerCount((c) => (c !== null ? Math.max(0, c - 1) : c));
      } else {
        await followBusiness(businessId);
        setIsFollowing(true);
        setFollowerCount((c) => (c !== null ? c + 1 : c));
      }
    } catch {
      // Silently ignore — could add a toast later
    } finally {
      setIsFollowLoading(false);
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
        <MaterialIcon
          name="storefront"
          className="text-5xl text-gray-300 dark:text-gray-700"
        />
        <h1 className="text-2xl font-bold text-[#111418] dark:text-white">
          {t("publicBusiness.notFound")}
        </h1>
        <p className="text-gray-500">{t("publicBusiness.notFoundDesc")}</p>
        <Button
          variant="outline"
          size="sm"
          className="w-auto px-6"
          onClick={() => navigate(-1)}
        >
          {t("publicBusiness.goBack")}
        </Button>
      </div>
    );
  }

  if (page.status === "suspended") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <MaterialIcon name="block" className="text-4xl text-red-500 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-[#111418] dark:text-white">
          Business Temporarily Unavailable
        </h1>
        <p className="text-gray-500 max-w-xs">
          This business has been suspended and is not currently accepting new bookings.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-auto px-6"
          onClick={() => navigate(-1)}
        >
          {t("publicBusiness.goBack")}
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
  const activeThemeColor = isEditing
    ? draft.themeColor
    : (business.themeColor ?? undefined);
  const themeStyle: React.CSSProperties | undefined = activeThemeColor
    ? ({ "--color-primary": activeThemeColor } as React.CSSProperties)
    : undefined;

  // Displayed logo/banner/search-image (preview overrides persisted value in edit mode)
  const displayLogo =
    isEditing && logoPreview ? logoPreview : resolveUploadUrl(business.logoUrl);
  const displayBanner =
    isEditing && bannerPreview
      ? bannerPreview
      : resolveUploadUrl(business.bannerUrl);
  const displaySearchImage =
    isEditing && searchImagePreview
      ? searchImagePreview
      : resolveUploadUrl(business.searchImageUrl);

  return (
    <div
      style={themeStyle}
      className="min-h-screen bg-gray-50 dark:bg-background-dark"
    >
      {isEditing && editTutorialActive && (
        <Tutorial
          tutorialKey="business-edit"
          steps={BUSINESS_EDIT_TUTORIAL_STEPS}
          onComplete={markEditTutorialSeen}
          onSkip={markEditTutorialSeen}
        />
      )}
      {/* ── Sticky top bar ── */}
      <div data-tutorial="business-edit-header" className="sticky top-0 z-50 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-background-dark">
        <button
          type="button"
          onClick={() =>
            isEditing ? dispatch({ type: "EXIT_EDIT" }) : navigate(-1)
          }
          className="inline-flex items-center justify-center rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label={
            isEditing ? t("publicBusiness.cancelEdit") : t("common.back")
          }
        >
          <MaterialIcon
            name={isEditing ? "close" : "arrow_back"}
            className="text-[#111418] dark:text-white"
          />
        </button>
        <span className="flex-1 text-base font-bold text-[#111418] truncate dark:text-white">
          {isEditing
            ? t("publicBusiness.editingTitle", { name: business.name })
            : business.name}
        </span>
        {isOwner && !isEditing && (
          <button
            type="button"
            onClick={() => dispatch({ type: "ENTER_EDIT" })}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold
              text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
          >
            <MaterialIcon name="edit" className="text-base" />
            {t("buttons.edit")}
          </button>
        )}
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold
              text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <MaterialIcon name="share" className="text-base" />
            {t("share.button")}
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
            {t("buttons.save")}
          </Button>
        )}
      </div>

      {/* ── Banner ── */}
      {(displayBanner || isEditing) && (
        <div data-tutorial="business-edit-images" className="relative w-full h-40 bg-primary/20 overflow-hidden">
          {displayBanner ? (
            <img
              src={displayBanner}
              alt={t("publicBusiness.bannerAlt")}
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
                    {isUploadingBanner
                      ? t("publicBusiness.uploading")
                      : t("publicBusiness.uploadBanner")}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: "SET_BANNER_PREVIEW",
                        preview: null,
                        file: null,
                      })
                    }
                    className="rounded-lg bg-white/80 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-white transition-colors shadow"
                  >
                    {t("buttons.cancel")}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#111418]
                    hover:bg-gray-100 transition-colors shadow"
                >
                  <MaterialIcon
                    name="add_photo_alternate"
                    className="text-base"
                  />
                  {displayBanner
                    ? t("publicBusiness.changeBanner")
                    : t("publicBusiness.addBanner")}
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
                  alt={t("publicBusiness.logoAlt")}
                  className="h-16 w-16 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MaterialIcon
                    name="storefront"
                    className="text-2xl text-primary"
                  />
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
                    aria-label={t("publicBusiness.changeLogoAriaLabel")}
                  >
                    <MaterialIcon
                      name="photo_camera"
                      className="text-white text-xs"
                    />
                  </button>
                </>
              )}
            </div>

            {isEditing ? (
              <div className="flex-1">
                <Input
                  value={draft.name}
                  onValueChange={(v) =>
                    dispatch({ type: "SET_DRAFT", field: "name", value: v })
                  }
                  placeholder={t("publicBusiness.businessNamePlaceholder")}
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
                {(business.reviewCount ?? 0) > 0 && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => {
                        const avg = business.averageRating ?? 0;
                        const filled = avg >= s;
                        const half = !filled && avg >= s - 0.5;
                        return (
                          <MaterialIcon
                            key={s}
                            name={
                              filled
                                ? "star"
                                : half
                                  ? "star_half"
                                  : "star_border"
                            }
                            className={`text-base leading-none ${filled || half ? "text-yellow-400" : "text-gray-300"}`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-sm font-semibold text-[#111418] dark:text-white">
                      {business.averageRating?.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {t("publicBusiness.reviewCount", {
                        count: business.reviewCount,
                      })}
                    </span>
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
                {isUploadingLogo
                  ? t("publicBusiness.uploading")
                  : t("publicBusiness.upload")}
              </button>
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: "SET_LOGO_PREVIEW",
                    preview: null,
                    file: null,
                  })
                }
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
                {t("publicBusiness.searchCardImageLabel")}
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("publicBusiness.searchCardImageDesc")}
              </p>
              <div className="flex items-center gap-3">
                {displaySearchImage ? (
                  <img
                    src={displaySearchImage}
                    alt={t("publicBusiness.searchCardPreviewAlt")}
                    className="h-20 w-32 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="h-20 w-32 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600">
                    <MaterialIcon
                      name="image_search"
                      className="text-2xl text-gray-400"
                    />
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
                    {displaySearchImage
                      ? t("publicBusiness.changeImage")
                      : t("publicBusiness.uploadImage")}
                  </button>
                  {displaySearchImage && !searchImageFile && (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch({
                          type: "SET_SEARCH_IMAGE_PREVIEW",
                          preview: null,
                          file: null,
                        })
                      }
                      className="text-xs text-gray-400 hover:text-red-500"
                    >
                      {t("publicBusiness.remove")}
                    </button>
                  )}
                </div>
              </div>
              {searchImageFile && (
                <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
                  <MaterialIcon
                    name="image"
                    className="text-primary text-base"
                  />
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                    {searchImageFile.name}
                  </span>
                  <button
                    type="button"
                    onClick={handleUploadSearchImage}
                    disabled={isUploadingSearchImage}
                    className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                  >
                    {isUploadingSearchImage
                      ? t("publicBusiness.uploading")
                      : t("publicBusiness.upload")}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: "SET_SEARCH_IMAGE_PREVIEW",
                        preview: null,
                        file: null,
                      })
                    }
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
                {t("publicBusiness.descriptionLabel")}
              </label>
              <textarea
                value={draft.description}
                onChange={(e) =>
                  dispatch({
                    type: "SET_DRAFT",
                    field: "description",
                    value: e.target.value,
                  })
                }
                placeholder={t("publicBusiness.descriptionEditPlaceholder")}
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
              <AddressAutocomplete
                label={t("publicBusiness.addressLabel")}
                value={draft.address}
                placeholder={t("publicBusiness.addressPlaceholder")}
                onAddressSelect={(result: AddressResult) =>
                  dispatch({
                    type: "SET_DRAFT_ADDRESS",
                    address: result.address,
                    latitude: result.latitude,
                    longitude: result.longitude,
                  })
                }
                onValueChange={(v) =>
                  dispatch({
                    type: "SET_DRAFT_ADDRESS",
                    address: v,
                    latitude: null,
                    longitude: null,
                  })
                }
              />
              <Input
                label={t("publicBusiness.phoneLabel")}
                type="tel"
                value={draft.phone}
                onValueChange={(v) =>
                  dispatch({ type: "SET_DRAFT", field: "phone", value: v })
                }
                placeholder="+1-555-0123"
                startIcon={<MaterialIcon name="call" className="text-sm" />}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {business.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MaterialIcon
                    name="location_on"
                    className="text-base text-gray-400"
                  />
                  <span>{business.address}</span>
                </div>
              )}
              {business.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MaterialIcon
                    name="call"
                    className="text-base text-gray-400"
                  />
                  <a
                    href={`tel:${business.phone}`}
                    className="hover:text-primary transition-colors"
                  >
                    {business.phone}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Follower count + follow button row (view mode) */}
          {!isEditing && (
            <div className="flex items-center gap-3 flex-wrap">
              {/* Follower count — visible to everyone */}
              {followerCount !== null && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <MaterialIcon name="favorite" className="text-base text-rose-400 icon-filled" />
                  <span>
                    {t("publicBusiness.followerCount", { count: followerCount })}
                  </span>
                </div>
              )}

              {/* Follow/unfollow button — authenticated non-owners only */}
              {isAuthenticated && !isOwner && (
                <button
                  type="button"
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading}
                  className={[
                    "flex items-center gap-2 self-start rounded-full px-5 py-2 text-sm font-semibold transition-all disabled:opacity-50",
                    isFollowing
                      ? "bg-primary/10 text-primary border border-primary/30 hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:hover:bg-red-900/20"
                      : "bg-primary text-white hover:brightness-95 shadow-sm",
                  ].join(" ")}
                >
                  {isFollowLoading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <MaterialIcon
                      name="favorite"
                      className={[
                        "text-base leading-none",
                        isFollowing ? "icon-filled" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />
                  )}
                  {isFollowing
                    ? t("publicBusiness.following")
                    : t("publicBusiness.follow")}
                </button>
              )}
            </div>
          )}

          {/* Theme color picker (edit mode only) */}
          {isEditing && (
            <div data-tutorial="business-edit-theme" className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[#111418] dark:text-gray-200">
                {t("publicBusiness.themeColorLabel")}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={draft.themeColor}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_DRAFT",
                      field: "themeColor",
                      value: e.target.value,
                    })
                  }
                  className="h-10 w-16 cursor-pointer rounded-lg border border-gray-300 bg-white p-1"
                  aria-label={t("publicBusiness.themeColorLabel")}
                />
                <span className="text-sm text-gray-500 font-mono">
                  {draft.themeColor}
                </span>
                <span className="text-xs text-gray-400">
                  {t("publicBusiness.themeColorHint")}
                </span>
              </div>
              {/* Accessibility contrast warning */}
              {!meetsAALarge(draft.themeColor, "#ffffff") && !meetsAALarge(draft.themeColor, "#111418") && (
                <p role="alert" className="flex items-center gap-1.5 text-xs text-warning">
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">warning</span>
                  {t("publicBusiness.themeColorContrastWarning")}
                </p>
              )}
            </div>
          )}

          {/* Save error */}
          {saveError && <p className="text-sm text-danger">{saveError}</p>}

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
                {t("publicBusiness.saveChanges")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => dispatch({ type: "EXIT_EDIT" })}
                disabled={isSaving}
              >
                {t("buttons.cancel")}
              </Button>
            </div>
          )}
        </Card>

        {/* ── Services section ── */}
        <section data-tutorial="business-edit-services">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#111418] dark:text-white">
              {t("publicBusiness.servicesTitle")}
            </h2>
            {isEditing && editingServiceId !== "new" && (
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: "EDIT_SERVICE", serviceId: "new" })
                }
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                <MaterialIcon name="add" className="text-base" />
                {t("publicBusiness.addServiceLink")}
              </button>
            )}
          </div>

          {services.length === 0 && !isEditing ? (
            <Card className="p-8 flex flex-col items-center gap-2 text-center">
              <MaterialIcon
                name="content_cut"
                className="text-4xl text-gray-300 dark:text-gray-700"
              />
              <p className="text-sm text-gray-500">
                {t("publicBusiness.noServicesListed")}
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {services.map((svc) =>
                isEditing && editingServiceId === svc.id ? (
                  <ServiceFormFields
                    key={svc.id}
                    draft={serviceDraft}
                    categories={categories}
                    businessId={businessId}
                    isNew={false}
                    isSaving={isServiceSaving}
                    error={serviceError}
                    onField={(f, v) =>
                      dispatch({ type: "SET_SERVICE_DRAFT", field: f, value: v })
                    }
                    onSave={handleSaveService}
                    onCancel={() => dispatch({ type: "CANCEL_SERVICE_EDIT" })}
                  />
                ) : (
                  <ServiceCard
                    key={svc.id}
                    service={svc}
                    businessSlug={businessSlug!}
                    slots={slotsByService[svc.id] ?? []}
                    slotsLoading={slotsLoadingFor.has(svc.id)}
                    isAuthenticated={isAuthenticated}
                    isEditing={isEditing}
                    isBeingEdited={
                      isEditing &&
                      editingServiceId !== null &&
                      editingServiceId !== svc.id
                    }
                    onEdit={() => handleEditService(svc)}
                    onDelete={() => handleDeleteService(svc.id)}
                    onManageSchedule={() =>
                      navigate(`/schedule/${businessId}/${svc.id}`)
                    }
                  />
                ),
              )}

              {/* Add service form */}
              {isEditing && editingServiceId === "new" && (
                <ServiceFormFields
                  draft={serviceDraft}
                  categories={categories}
                  businessId={businessId}
                  isNew
                  isSaving={isServiceSaving}
                  error={serviceError}
                  onField={(f, v) =>
                    dispatch({ type: "SET_SERVICE_DRAFT", field: f, value: v })
                  }
                  onSave={handleSaveService}
                  onCancel={() => dispatch({ type: "CANCEL_SERVICE_EDIT" })}
                />
              )}

              {services.length === 0 &&
                isEditing &&
                editingServiceId !== "new" && (
                  <Card className="p-6 flex flex-col items-center gap-2 text-center border-dashed">
                    <MaterialIcon
                      name="content_cut"
                      className="text-3xl text-gray-300 dark:text-gray-700"
                    />
                    <p className="text-sm text-gray-500">
                      {t("publicBusiness.noServicesYet")}
                    </p>
                  </Card>
                )}
            </div>
          )}
        </section>

        {/* ── Reviews section ── */}
        {!isEditing && (
          <BusinessReviewsSection
            reviews={reviews}
            reviewsLoading={reviewsLoading}
            reviewsHasMore={reviewsHasMore}
            onLoadMore={handleLoadMoreReviews}
          />
        )}
      </div>

      {/* Share modal */}
      {page.status === "ready" && (
        <ShareModal
          open={isShareOpen}
          businessSlug={businessSlug ?? ""}
          businessName={page.business.name}
          onClose={() => setIsShareOpen(false)}
        />
      )}
    </div>
  );
}
