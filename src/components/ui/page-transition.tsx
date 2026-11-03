"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";

type Phase = "idle" | "covering" | "revealing";

type Navigate = (href: string) => boolean;

type TimerRef = { current: ReturnType<typeof setTimeout> | null };

const COVER_DURATION = 850;

const SAFETY_DURATION = process.env.NODE_ENV === "development" ? 20000 : 8000;

const WAITING_DELAY = 2000;
const EASING = "cubic-bezier(0.65, 0, 0.35, 1)";

const LIQUID_FILTER_ID = "leadevent-curtain-liquid";
const DISPLACEMENT_SCALE = 52;
const LIQUID_FILTER = `url(#${LIQUID_FILTER_ID})`;

const PageTransitionContext = createContext<Navigate | null>(null);

function clearTimer(ref: TimerRef): void {
  if (ref.current !== null) {
    clearTimeout(ref.current);
    ref.current = null;
  }
}

function isInternalHref(href: string): boolean {
  if (!href) return false;
  if (href.startsWith("#")) return false;
  if (href.startsWith("//")) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)) return false;
  return true;
}

function normalizePath(value: string): string {
  const path = value.split(/[?#]/, 1)[0] ?? "";
  if (!path) return "/";
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

function overlayTransform(phase: Phase): string {
  if (phase === "covering") return "translateX(0)";
  if (phase === "revealing") return "translateX(-100%)";
  return "translateX(100%)";
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<Phase>("idle");
  const [waiting, setWaiting] = useState(false);

  const phaseRef = useRef<Phase>("idle");
  const pendingHrefRef = useRef<string | null>(null);
  const previousOverflowRef = useRef<string>("");
  const isLockedRef = useRef(false);

  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
    setWaiting(false);
  }, []);

  const unlockScroll = useCallback(() => {
    if (typeof document === "undefined") return;
    if (!isLockedRef.current) return;
    document.body.style.overflow = previousOverflowRef.current;
    isLockedRef.current = false;
  }, []);

  const navigate = useCallback<Navigate>(
    (href) => {
      if (typeof window === "undefined") return false;
      if (phaseRef.current !== "idle") return true;
      if (!isInternalHref(href)) return false;
      if (normalizePath(href) === normalizePath(pathname)) return false;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return true;
      }

      clearTimer(pushTimerRef);
      clearTimer(safetyTimerRef);
      clearTimer(finishTimerRef);

      pendingHrefRef.current = href;

      if (!isLockedRef.current) {
        previousOverflowRef.current = document.body.style.overflow;
        isLockedRef.current = true;
      }
      document.body.style.overflow = "hidden";

      updatePhase("covering");
      return true;
    },
    [pathname, router, updatePhase]
  );
  useEffect(() => {
    if (phase !== "covering") return;

    pushTimerRef.current = setTimeout(() => {
      pushTimerRef.current = null;
      const href = pendingHrefRef.current;
      if (href !== null) router.push(href);
    }, COVER_DURATION);

    safetyTimerRef.current = setTimeout(() => {
      safetyTimerRef.current = null;
      if (phaseRef.current === "covering") updatePhase("revealing");
    }, SAFETY_DURATION);

    return () => {
      clearTimer(pushTimerRef);
      clearTimer(safetyTimerRef);
    };
  }, [phase, router, updatePhase]);

  useEffect(() => {
    const pending = pendingHrefRef.current;
    if (pending === null) return;
    if (phaseRef.current !== "covering") return;
    if (normalizePath(pathname) !== normalizePath(pending)) return;
    updatePhase("revealing");
  }, [pathname, updatePhase]);

  useEffect(() => {
    if (phase !== "covering") return;

    const timer = setTimeout(() => setWaiting(true), WAITING_DELAY);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "revealing") return;

    finishTimerRef.current = setTimeout(() => {
      finishTimerRef.current = null;
      pendingHrefRef.current = null;
      updatePhase("idle");
      unlockScroll();
    }, COVER_DURATION);

    return () => clearTimer(finishTimerRef);
  }, [phase, updatePhase, unlockScroll]);

  useEffect(() => {
    return () => {
      clearTimer(pushTimerRef);
      clearTimer(safetyTimerRef);
      clearTimer(finishTimerRef);
      if (typeof document !== "undefined" && isLockedRef.current) {
        document.body.style.overflow = previousOverflowRef.current;
        isLockedRef.current = false;
      }
    };
  }, []);

  const overlayStyle: CSSProperties = {
    transform: overlayTransform(phase),
    transition: phase === "idle" ? "none" : `transform ${COVER_DURATION}ms ${EASING}`,
    filter: phase === "idle" ? "none" : LIQUID_FILTER,
    pointerEvents: phase === "idle" ? "none" : "auto",
  };

  return (
    <PageTransitionContext.Provider value={navigate}>
      {children}
      <svg
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute size-0"
      >
        <defs>
          <filter
            id={LIQUID_FILTER_ID}
            x="-30%"
            y="-15%"
            width="160%"
            height="130%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.003 0.007"
              numOctaves={1}
              seed={7}
              result="liquidNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="liquidNoise"
              scale={DISPLACEMENT_SCALE}
              xChannelSelector="R"
              yChannelSelector="G"
              result="liquidEdge"
            />
            <feGaussianBlur in="liquidEdge" stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>

      <div
        aria-hidden="true"
        className="fixed bottom-[-140px] left-[-140px] right-[-140px] top-[-140px] z-[100] bg-[#2a1f18] will-change-transform"
        style={overlayStyle}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_10%,#3b2a20_0%,#2a1f18_45%,#1d1511_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-px bg-white/10"
        />
      </div>

      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-[101] flex flex-col items-center justify-center gap-3 transition-opacity duration-500 ${
          waiting ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">
          Abrindo
        </p>
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {waiting ? "Abrindo a página, aguarde." : ""}
      </span>
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition(): Navigate {
  const navigate = useContext(PageTransitionContext);
  const router = useRouter();

  return useCallback<Navigate>(
    (href) => {
      if (navigate) return navigate(href);
      router.push(href);
      return true;
    },
    [navigate, router]
  );
}

export type TransitionLinkProps = Omit<
  ComponentProps<typeof Link>,
  "onNavigate"
> & {
  onNavigate?: () => void;
};

export function TransitionLink({
  href,
  target,
  onClick,
  onNavigate,
  children,
  ...rest
}: TransitionLinkProps) {
  const navigate = usePageTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    if (target && target !== "_self") return;
    if (typeof href !== "string") return;
    if (!isInternalHref(href)) return;
    if (!navigate(href)) return;

    event.preventDefault();
    onNavigate?.();
  };

  return (
    <Link {...rest} href={href} target={target} onClick={handleClick}>
      {children}
    </Link>
  );
}
