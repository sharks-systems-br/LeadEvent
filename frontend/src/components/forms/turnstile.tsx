"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const LOAD_TIMEOUT_MS = 10000;

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

export const TURNSTILE_ENABLED = SITE_KEY.length > 0;

interface TurnstileWidgetOptions {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact" | "flexible";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
  "timeout-callback"?: () => void;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileWidgetOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loaderPromise: Promise<TurnstileApi | null> | null = null;

function loadTurnstile(): Promise<TurnstileApi | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );

    const timeoutId = window.setTimeout(
      () => resolve(window.turnstile ?? null),
      LOAD_TIMEOUT_MS
    );

    const handleLoad = () => {
      window.clearTimeout(timeoutId);
      resolve(window.turnstile ?? null);
    };

    const handleError = () => {
      window.clearTimeout(timeoutId);
      resolve(null);
    };

    if (existing) {
      existing.addEventListener("load", handleLoad, { once: true });
      existing.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  });

  return loaderPromise;
}

interface TurnstileProps {
  onVerify: (token: string | null) => void;
  className?: string;
}

export function Turnstile({ onVerify, className }: TurnstileProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetRef = React.useRef<string | null>(null);
  const verifyRef = React.useRef(onVerify);
  const [api, setApi] = React.useState<TurnstileApi | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    verifyRef.current = onVerify;
  }, [onVerify]);

  React.useEffect(() => {
    if (!TURNSTILE_ENABLED) return;

    let active = true;

    loadTurnstile().then((instance) => {
      if (!active) return;
      setApi(instance);
      setFailed(instance === null);
    });

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    if (!api || !containerRef.current || widgetRef.current) return;

    widgetRef.current = api.render(containerRef.current, {
      sitekey: SITE_KEY,
      theme: "light",
      size: "flexible",
      callback: (token) => verifyRef.current(token),
      "expired-callback": () => verifyRef.current(null),
      "error-callback": () => verifyRef.current(null),
      "timeout-callback": () => verifyRef.current(null),
    });

    return () => {
      if (widgetRef.current) {
        api.remove(widgetRef.current);
        widgetRef.current = null;
      }
    };
  }, [api]);

  if (!TURNSTILE_ENABLED) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <div ref={containerRef} />
      {!api && (
        <p
          className={cn(
            "text-[11px]",
            failed ? "font-medium text-red-600" : "text-muted-foreground"
          )}
        >
          {failed
            ? "Não foi possível carregar a verificação. Recarregue a página."
            : "Carregando verificação de segurança..."}
        </p>
      )}
    </div>
  );
}
