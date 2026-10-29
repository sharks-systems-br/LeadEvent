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

type Navigate = (href: string) => void;

type TimerRef = { current: ReturnType<typeof setTimeout> | null };

const COVER_DURATION = 850;
const SAFETY_DURATION = 4000;
const EASING = "cubic-bezier(0.65, 0, 0.35, 1)";

/**
 * Wavy (liquid) leading edge. The panel is oversized on top/bottom/right so the
 * displacement only affects the edge that actually sweeps across the viewport.
 */
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
  // Any explicit scheme (http:, https:, mailto:, tel:, javascript:, …).
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
  }, []);

  const unlockScroll = useCallback(() => {
    if (typeof document === "undefined") return;
    if (!isLockedRef.current) return;
    document.body.style.overflow = previousOverflowRef.current;
    isLockedRef.current = false;
  }, []);

  const navigate = useCallback<Navigate>(
    (href) => {
      if (typeof window === "undefined") return;
      if (phaseRef.current !== "idle") return;
      if (!isInternalHref(href)) return;
      if (normalizePath(href) === normalizePath(pathname)) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
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
    },
    [pathname, router, updatePhase]
  );

  // Cover the viewport for 620ms, then let the route change underneath.
  // The safety timer reveals the page even if the route never settles.
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

  // As soon as the pending route is rendered, slide the curtain away.
  useEffect(() => {
    const pending = pendingHrefRef.current;
    if (pending === null) return;
    if (phaseRef.current !== "covering") return;
    if (normalizePath(pathname) !== normalizePath(pending)) return;
    updatePhase("revealing");
  }, [pathname, updatePhase]);

  // Let the curtain finish sliding out, then park it off-screen and unscroll.
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

  // Never leave the body locked or a timer running if the provider unmounts.
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
    // Must be instantaneous while idle: resetting from -100% to +100% with a
    // transition would sweep the panel across the viewport.
    transition: phase === "idle" ? "none" : `transform ${COVER_DURATION}ms ${EASING}`,
    // The filter is off at rest so the displaced pixels never peek at the edge.
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
            {/* Softens the rasterised wave into a creamy, anti-aliased edge. */}
            <feGaussianBlur in="liquidEdge" stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>

      <div
        aria-hidden="true"
        className="fixed bottom-[-140px] left-0 right-[-140px] top-[-140px] z-[100] bg-[#2a1f18] will-change-transform"
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
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition(): Navigate {
  const navigate = useContext(PageTransitionContext);
  const router = useRouter();

  return useCallback<Navigate>(
    (href) => {
      if (navigate) {
        navigate(href);
        return;
      }
      router.push(href);
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

    event.preventDefault();
    onNavigate?.();
    navigate(href);
  };

  return (
    <Link {...rest} href={href} target={target} onClick={handleClick}>
      {children}
    </Link>
  );
}
