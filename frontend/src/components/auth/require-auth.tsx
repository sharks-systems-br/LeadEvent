"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  clearTokens,
  hasSession,
  UNAUTHORIZED_EVENT,
} from "@/lib/auth";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", callback);
  window.addEventListener(UNAUTHORIZED_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(UNAUTHORIZED_EVENT, callback);
  };
}

function getSnapshot() {
  return hasSession();
}

function getServerSnapshot() {
  return false;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (hasSession()) return;

    clearTokens();
    router.replace("/login");
  }, [router, session]);

  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#f7f8f8] text-sm text-muted-foreground">
        Verificando acesso...
      </div>
    );
  }

  return <>{children}</>;
}
