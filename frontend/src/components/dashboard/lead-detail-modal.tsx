"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function LeadDetailModal({
  label,
  media,
  children,
  onClose,
}: {
  label: string;
  media?: ReactNode;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-[#04131f]/85 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "relative my-auto flex w-full animate-in flex-col overflow-hidden rounded-4xl border border-white/10 bg-[#061a2b] text-white shadow-2xl fade-in zoom-in-95 duration-300",
          media ? "max-w-7xl md:max-h-[88vh] md:flex-row" : "max-w-3xl"
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes"
          className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
        >
          <X className="size-4" />
        </button>

        {media && (
          <div className="flex shrink-0 items-center justify-center border-b border-white/[0.06] bg-black/40 bg-[radial-gradient(circle_at_50%_45%,rgba(45,212,191,0.10),transparent_62%)] p-3 md:w-[60%] md:border-b-0 md:border-r">
            {media}
          </div>
        )}

        <div
          className={cn(
            "min-h-0 flex-1 p-5 sm:p-7",
            media
              ? "md:overflow-y-auto md:[scrollbar-width:thin]"
              : "max-h-[88vh] overflow-y-auto [scrollbar-width:thin]"
          )}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
