import { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";
import { MaterialIcon } from "./MaterialIcon";
import { Button } from "./Button";
import { useFocusTrap } from "../../hooks/useFocusTrap";

interface Props {
  open: boolean;
  businessSlug: string;
  businessName: string;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

type Tab = "link" | "qr";

export function ShareModal({ open, businessSlug, businessName, onClose, triggerRef }: Props) {
  const { t } = useTranslation();
  const titleId = useId();
  const tabListId = useId();
  const [tab, setTab] = useState<Tab>("link");
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const { containerRef } = useFocusTrap<HTMLDivElement>({
    active: open,
    returnRef: triggerRef,
  });

  const shareUrl = `${window.location.origin}/business/${businessSlug}`;

  function handleCopy() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      window.prompt(t("share.copyFallback"), shareUrl);
    }
  }

  function handleDownloadQR() {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${businessSlug}-qr.png`;
    a.click();
  }

  if (!open) return null;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-surface-dark shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2
            id={titleId}
            className="font-bold text-[#111418] dark:text-white text-base"
          >
            {t("share.modalTitle", { name: businessName })}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            aria-label={t("share.closeAriaLabel")}
          >
            <MaterialIcon name="close" className="text-xl" aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label={t("share.tabsLabel")}
          className="flex border-b border-[#e7edf3] dark:border-gray-700 mx-5"
        >
          {(["link", "qr"] as Tab[]).map((tabKey) => (
            <button
              key={tabKey}
              type="button"
              role="tab"
              id={`${tabListId}-tab-${tabKey}`}
              aria-selected={tab === tabKey}
              aria-controls={`${tabListId}-panel-${tabKey}`}
              onClick={() => setTab(tabKey)}
              className={[
                "flex-1 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
                tab === tabKey
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
              ].join(" ")}
            >
              {tabKey === "link" ? t("share.tabLink") : t("share.tabQR")}
            </button>
          ))}
        </div>

        <div className="px-5 py-5">
          <div
            role="tabpanel"
            id={`${tabListId}-panel-link`}
            aria-labelledby={`${tabListId}-tab-link`}
            hidden={tab !== "link"}
          >
            {tab === "link" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("share.linkDescription")}
                </p>
                <div className="flex items-center gap-2 rounded-xl border border-[#e7edf3] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2">
                  <MaterialIcon name="link" className="text-base text-gray-400 shrink-0" aria-hidden="true" />
                  <span className="flex-1 text-sm text-[#111418] dark:text-gray-300 truncate select-all">
                    {shareUrl}
                  </span>
                </div>
                <Button
                  variant={copied ? "outline" : "primary"}
                  className="w-full gap-2"
                  onClick={handleCopy}
                  aria-live="polite"
                >
                  <MaterialIcon
                    name={copied ? "check_circle" : "content_copy"}
                    className="text-base"
                    aria-hidden="true"
                  />
                  {copied ? t("share.copied") : t("share.copyButton")}
                </Button>
              </div>
            )}
          </div>

          <div
            role="tabpanel"
            id={`${tabListId}-panel-qr`}
            aria-labelledby={`${tabListId}-tab-qr`}
            hidden={tab !== "qr"}
          >
            {tab === "qr" && (
              <div className="space-y-4 flex flex-col items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center w-full">
                  {t("share.qrDescription")}
                </p>
                <div className="rounded-2xl border border-[#e7edf3] dark:border-gray-700 p-4 bg-white">
                  <QRCodeCanvas
                    ref={qrCanvasRef}
                    value={shareUrl}
                    size={200}
                    level="M"
                    marginSize={2}
                    aria-label={t("share.qrAriaLabel", { name: businessName })}
                  />
                </div>
                <Button
                  variant="primary"
                  className="w-full gap-2"
                  onClick={handleDownloadQR}
                >
                  <MaterialIcon name="download" className="text-base" aria-hidden="true" />
                  {t("share.downloadQR")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
