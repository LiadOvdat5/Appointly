import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";
import { MaterialIcon } from "./MaterialIcon";
import { Button } from "./Button";

interface Props {
  open: boolean;
  businessSlug: string;
  businessName: string;
  onClose: () => void;
}

type Tab = "link" | "qr";

export function ShareModal({ open, businessSlug, businessName, onClose }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("link");
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const shareUrl = `${window.location.origin}/business/${businessSlug}`;

  function handleCopy() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      // Fallback for browsers without Clipboard API
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-surface-dark shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-bold text-[#111418] dark:text-white text-base">
            {t("share.modalTitle", { name: businessName })}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <MaterialIcon name="close" className="text-xl" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#e7edf3] dark:border-gray-700 mx-5">
          {(["link", "qr"] as Tab[]).map((t2) => (
            <button
              key={t2}
              type="button"
              onClick={() => setTab(t2)}
              className={[
                "flex-1 py-2 text-sm font-semibold transition-colors",
                tab === t2
                  ? "border-b-2 border-primary text-primary"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
              ].join(" ")}
            >
              {t2 === "link" ? t("share.tabLink") : t("share.tabQR")}
            </button>
          ))}
        </div>

        <div className="px-5 py-5">
          {tab === "link" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("share.linkDescription")}
              </p>
              {/* URL display */}
              <div className="flex items-center gap-2 rounded-xl border border-[#e7edf3] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2">
                <MaterialIcon name="link" className="text-base text-gray-400 shrink-0" />
                <span className="flex-1 text-sm text-[#111418] dark:text-gray-300 truncate select-all">
                  {shareUrl}
                </span>
              </div>
              <Button
                variant={copied ? "outline" : "primary"}
                className="w-full gap-2"
                onClick={handleCopy}
              >
                <MaterialIcon
                  name={copied ? "check_circle" : "content_copy"}
                  className="text-base"
                />
                {copied ? t("share.copied") : t("share.copyButton")}
              </Button>
            </div>
          )}

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
                />
              </div>
              <Button
                variant="primary"
                className="w-full gap-2"
                onClick={handleDownloadQR}
              >
                <MaterialIcon name="download" className="text-base" />
                {t("share.downloadQR")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
