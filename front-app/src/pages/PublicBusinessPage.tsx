import { useEffect, useReducer } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import {
  getPublicBusinessById,
  getPublicServicesForBusiness,
} from "../services/businessManagementService";
import {
  getAvailableSlotsForService,
  type SlotDTO,
} from "../services/scheduleService";
import type { BusinessProfile, ServiceProfile } from "../types/business";
import { Button } from "../components/UI/Button";
import { Card } from "../components/UI/Card";
import { MaterialIcon } from "../components/UI/MaterialIcon";

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── Page state (discriminated union — avoids sync setState in effects) ───────

type PageState =
  | { status: "loading" }
  | { status: "not_found" }
  | {
      status: "ready";
      business: BusinessProfile;
      services: ServiceProfile[];
      slotsByService: Record<string, SlotDTO[]>;
      slotsLoadingFor: Set<string>;
    };

type PageAction =
  | { type: "LOADED"; business: BusinessProfile; services: ServiceProfile[] }
  | { type: "NOT_FOUND" }
  | { type: "SLOTS_LOADING"; serviceId: string }
  | { type: "SLOTS_READY"; serviceId: string; slots: SlotDTO[] };

function pageReducer(_state: PageState, action: PageAction): PageState {
  switch (action.type) {
    case "LOADED":
      return {
        status: "ready",
        business: action.business,
        services: action.services,
        slotsByService: {},
        slotsLoadingFor: new Set(action.services.map((s) => s.id)),
      };
    case "NOT_FOUND":
      return { status: "not_found" };
    case "SLOTS_LOADING": {
      if (_state.status !== "ready") return _state;
      const next = new Set(_state.slotsLoadingFor);
      next.add(action.serviceId);
      return { ..._state, slotsLoadingFor: next };
    }
    case "SLOTS_READY": {
      if (_state.status !== "ready") return _state;
      const next = new Set(_state.slotsLoadingFor);
      next.delete(action.serviceId);
      return {
        ..._state,
        slotsByService: { ..._state.slotsByService, [action.serviceId]: action.slots },
        slotsLoadingFor: next,
      };
    }
    default:
      return _state;
  }
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function ServiceCardItem({
  service,
  businessId,
  slots,
  slotsLoading,
  isAuthenticated,
}: {
  service: ServiceProfile;
  businessId: string;
  slots: SlotDTO[];
  slotsLoading: boolean;
  isAuthenticated: boolean;
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
    <Card className="p-5 flex flex-col gap-4">
      {/* Service header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-bold text-[#111418] dark:text-white text-base">
            {service.name}
          </p>
          {service.description && (
            <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
          )}
        </div>
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
      </div>

      {/* Available slots preview */}
      <div>
        {slotsLoading ? (
          <p className="text-xs text-gray-400">Checking availability…</p>
        ) : previewSlots.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {previewSlots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => handleBook(`?slotId=${slot.id}`)}
                className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary
                  hover:bg-primary/10 active:scale-95 transition-all"
              >
                {formatSlotDate(slot.startDateTime)}{" "}
                <span className="font-bold">
                  {formatSlotTime(slot.startDateTime)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No upcoming slots available</p>
        )}
      </div>

      {/* Book button */}
      <Button variant="primary" size="sm" onClick={() => handleBook()}>
        Book
      </Button>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PublicBusinessPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const isAuthenticated = authStatus === "authenticated";

  const [page, dispatch] = useReducer(pageReducer, { status: "loading" });

  // Load business + services — no sync setState in effect body
  useEffect(() => {
    if (!businessId) return;

    let cancelled = false;

    Promise.all([
      getPublicBusinessById(businessId),
      getPublicServicesForBusiness(businessId),
    ])
      .then(([biz, svcs]) => {
        if (!cancelled) dispatch({ type: "LOADED", business: biz, services: svcs });
      })
      .catch((err) => {
        if (!cancelled && err?.response?.status === 404)
          dispatch({ type: "NOT_FOUND" });
      });

    return () => {
      cancelled = true;
    };
  }, [businessId]);

  // Load slots once services are known — no sync setState in effect body
  useEffect(() => {
    if (page.status !== "ready" || !page.services.length) return;

    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);

    let cancelled = false;

    page.services.forEach((svc) => {
      getAvailableSlotsForService(svc.id, today, in30Days)
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
          Business not found
        </h1>
        <p className="text-gray-500">
          This business page doesn't exist or has been removed.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-auto px-6"
          onClick={() => navigate(-1)}
        >
          Go back
        </Button>
      </div>
    );
  }

  const { business, services, slotsByService, slotsLoadingFor } = page;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      {/* Back nav */}
      <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-background-dark">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Back"
        >
          <MaterialIcon name="arrow_back" className="text-[#111418] dark:text-white" />
        </button>
        <span className="text-base font-bold text-[#111418] truncate dark:text-white">
          {business.name}
        </span>
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-16 pt-6 flex flex-col gap-6">
        {/* ── Business header card ── */}
        <Card className="p-6 flex flex-col gap-4">
          <div>
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

          {business.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {business.description}
            </p>
          )}

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
                <a
                  href={`tel:${business.phone}`}
                  className="hover:text-primary transition-colors"
                >
                  {business.phone}
                </a>
              </div>
            )}
          </div>
        </Card>

        {/* ── Services section ── */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-[#111418] dark:text-white">
            Services
          </h2>

          {services.length === 0 ? (
            <Card className="p-8 flex flex-col items-center gap-2 text-center">
              <MaterialIcon
                name="content_cut"
                className="text-4xl text-gray-300 dark:text-gray-700"
              />
              <p className="text-sm text-gray-500">
                This business hasn't listed any services yet.
              </p>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {services.map((svc) => (
                <ServiceCardItem
                  key={svc.id}
                  service={svc}
                  businessId={businessId!}
                  slots={slotsByService[svc.id] ?? []}
                  slotsLoading={slotsLoadingFor.has(svc.id)}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
