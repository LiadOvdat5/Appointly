import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MaterialIcon } from "../components/UI/MaterialIcon";
import { Card } from "../components/UI/Card";
import {
  getPendingCategoryRequests,
  approveCategoryRequest,
  rejectCategoryRequest,
  type AdminCategoryRequest,
} from "../services/adminService";

export default function AdminCategoryRequestsPage() {
  const { t } = useTranslation();

  const [requests, setRequests] = useState<AdminCategoryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Per-request UI state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null); // requestId being acted on
  const [actionError, setActionError] = useState<{ id: string; msg: string } | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingCategoryRequests();
      setRequests(data);
    } catch {
      setError(t("admin.categoryRequests.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (req: AdminCategoryRequest) => {
    setActionLoading(req.id);
    setActionError(null);
    try {
      await approveCategoryRequest(req.id, {
        name: editName.trim() || undefined,
        iconName: editIcon.trim() || undefined,
      });
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      setEditingId(null);
    } catch {
      setActionError({ id: req.id, msg: t("admin.categoryRequests.approveError") });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    setActionError(null);
    try {
      await rejectCategoryRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setActionError({ id, msg: t("admin.categoryRequests.rejectError") });
    } finally {
      setActionLoading(null);
    }
  };

  const startEdit = (req: AdminCategoryRequest) => {
    setEditingId(req.id);
    setEditName(req.aiSuggestedName ?? "");
    setEditIcon(req.aiSuggestedIcon ?? "");
    setActionError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark">
      {/* Header */}
      <div className="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <MaterialIcon name="admin_panel_settings" className="text-primary text-xl" />
            </div>
            <div>
              <h1 className="font-bold text-[#111418] dark:text-white text-base leading-tight">
                {t("admin.categoryRequests.title")}
              </h1>
              <p className="text-xs text-gray-500">{t("admin.categoryRequests.subtitle")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {loading && (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <MaterialIcon name="error_outline" className="text-red-500 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <MaterialIcon name="check_circle" className="text-3xl text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-[#111418] dark:text-white">
                {t("admin.categoryRequests.empty.title")}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {t("admin.categoryRequests.empty.text")}
              </p>
            </div>
          </div>
        )}

        {!loading && requests.map((req) => {
          const isEditing = editingId === req.id;
          const isBusy = actionLoading === req.id;
          const thisError = actionError?.id === req.id ? actionError.msg : null;

          return (
            <Card key={req.id} className="p-5 space-y-4">
              {/* Meta row */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {t("admin.categoryRequests.requester")}
                  </p>
                  <p className="text-sm font-semibold text-[#111418] dark:text-white">
                    {req.requesterName}
                  </p>
                  <p className="text-xs text-gray-400">{req.requesterEmail}</p>
                  {req.businessName && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      <MaterialIcon name="store" className="text-xs inline mr-1" />
                      {req.businessName}
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400 shrink-0">
                  {new Date(req.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  {t("admin.categoryRequests.description")}
                </p>
                <p className="text-sm text-[#111418] dark:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                  {req.description}
                </p>
              </div>

              {/* AI suggestion */}
              {(req.aiSuggestedName || req.aiSuggestedIcon) && !isEditing && (
                <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
                  {req.aiSuggestedIcon && (
                    <MaterialIcon name={req.aiSuggestedIcon} className="text-primary text-xl shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-primary font-semibold">
                      {t("admin.categoryRequests.aiSuggestion")}
                    </p>
                    <p className="text-sm font-bold text-[#111418] dark:text-white">
                      {req.aiSuggestedName ?? t("admin.categoryRequests.noName")}
                    </p>
                    {req.aiSuggestedIcon && (
                      <p className="text-xs text-gray-400">{req.aiSuggestedIcon}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(req)}
                    className="ml-auto text-xs text-primary hover:underline shrink-0"
                  >
                    {t("admin.categoryRequests.edit")}
                  </button>
                </div>
              )}

              {/* Edit form */}
              {isEditing && (
                <div className="space-y-3 rounded-lg border border-primary/30 p-3 bg-primary/5">
                  <p className="text-xs font-semibold text-primary">
                    {t("admin.categoryRequests.editTitle")}
                  </p>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder={t("admin.categoryRequests.namePlaceholder")}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-[#111418] dark:text-white outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="text"
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                      placeholder={t("admin.categoryRequests.iconPlaceholder")}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-[#111418] dark:text-white outline-none focus:ring-2 focus:ring-primary"
                    />
                    {editIcon && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MaterialIcon name={editIcon} className="text-primary" />
                        <span>{editIcon}</span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-xs text-gray-400 hover:underline"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              )}

              {/* No AI suggestion + not editing */}
              {!req.aiSuggestedName && !isEditing && (
                <div className="flex items-center gap-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-3 py-2">
                  <MaterialIcon name="warning" className="text-yellow-500 text-sm shrink-0" />
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    {t("admin.categoryRequests.noAiSuggestion")}
                  </p>
                  <button
                    type="button"
                    onClick={() => startEdit(req)}
                    className="ml-auto text-xs text-primary hover:underline shrink-0"
                  >
                    {t("admin.categoryRequests.addName")}
                  </button>
                </div>
              )}

              {/* Error */}
              {thisError && (
                <p className="text-xs text-red-500">{thisError}</p>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  disabled={isBusy || (!isEditing && !req.aiSuggestedName && !editName.trim())}
                  onClick={() => handleApprove(req)}
                  className="flex items-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 transition"
                >
                  {isBusy ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <MaterialIcon name="check_circle" className="text-base leading-none" />
                  )}
                  {t("admin.categoryRequests.approve")}
                </button>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleReject(req.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 dark:text-red-400 text-sm font-semibold px-4 py-2 transition"
                >
                  <MaterialIcon name="cancel" className="text-base leading-none" />
                  {t("admin.categoryRequests.reject")}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
