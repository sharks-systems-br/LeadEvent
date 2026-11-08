"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Clapperboard, Link2, Maximize2, Play, X } from "lucide-react";
import type { VideoLink } from "@/lib/form-validation";
import { formatFileSize } from "@/lib/form-validation";
import { MAX_VIDEO_SIZE_MB } from "@/lib/video-validation";
import { buildVideoEmbed } from "@/lib/video-embeds";
import { cn } from "@/lib/utils";

export type PreviewSource =
  | VideoLink
  | {
      kind: "upload";
      url: string;
      label: string;
      fileName: string;
      fileSize: number;
    };

interface VideoPreviewProps {
  source: PreviewSource | null;
  onClear?: () => void;
  onFormatChange?: (label: string | null) => void;
  className?: string;
}

const DEFAULT_RATIO = 4 / 5;
const MIN_RATIO = 0.5;
const MAX_RATIO = 2.1;
const SLOW_LOAD_MS = 4200;
const EASE = [0.22, 1, 0.36, 1] as const;

const COMMON_RATIOS: ReadonlyArray<readonly [number, number]> = [
  [9, 16],
  [3, 4],
  [4, 5],
  [1, 1],
  [5, 4],
  [4, 3],
  [3, 2],
  [16, 9],
  [2, 1],
  [21, 9],
];

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}

function describeAspect(width: number, height: number) {
  if (!width || !height) return null;

  const ratio = width / height;
  const common = COMMON_RATIOS.reduce((best, current) =>
    Math.abs(current[0] / current[1] - ratio) <
    Math.abs(best[0] / best[1] - ratio)
      ? current
      : best
  );

  const divisor = greatestCommonDivisor(Math.round(width), Math.round(height));
  const reducedWidth = Math.round(width) / divisor;
  const reducedHeight = Math.round(height) / divisor;
  const isSimpleRatio = reducedWidth <= 32 && reducedHeight <= 32;

  return {
    ratio: Math.min(Math.max(ratio, MIN_RATIO), MAX_RATIO),
    label: isSimpleRatio
      ? `${reducedWidth}:${reducedHeight}`
      : `${common[0]}:${common[1]}`,
  };
}

interface MediaProps {
  source: PreviewSource;
  onReady?: () => void;
  onError?: () => void;
  onAspectRatio?: (width: number, height: number) => void;
  className?: string;
  autoPlay?: boolean;
}

function Media({
  source,
  onReady,
  onError,
  onAspectRatio,
  className,
  autoPlay = false,
}: MediaProps) {
  if (source.kind === "file" || source.kind === "upload") {
    return (
      <video
        src={source.url}
        controls
        playsInline
        autoPlay={autoPlay}
        preload="metadata"
        controlsList="nodownload"
        onLoadedMetadata={(event) =>
          onAspectRatio?.(
            event.currentTarget.videoWidth,
            event.currentTarget.videoHeight
          )
        }
        onLoadedData={onReady}
        onError={onError}
        className={cn("h-full w-full bg-black object-contain", className)}
      />
    );
  }

  if (source.kind === "tiktok" && source.needsResolution) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-black px-6 text-center text-xs text-white/60",
          className
        )}
      >
        Resolvendo link do TikTok…
      </div>
    );
  }

  const embed = buildVideoEmbed(source, autoPlay);
  if (!embed) return null;

  return (
    <iframe
      src={embed.src}
      title={embed.title}
      loading="lazy"
      onLoad={onReady}
      allow={embed.allow}
      allowFullScreen
      className={cn("h-full w-full border-0", className)}
    />
  );
}

function sourceKey(source: PreviewSource | null): string {
  if (!source) return "empty";
  if (source.kind === "youtube") return `youtube-${source.id}`;
  if (source.kind === "vimeo") return `vimeo-${source.id}`;
  if (source.kind === "instagram") return `instagram-${source.id}`;
  if (source.kind === "tiktok") return `tiktok-${source.id || source.url}`;
  return `${source.kind}-${source.url}`;
}

function sourceDescription(source: PreviewSource): string {
  return source.kind === "upload"
    ? `${source.fileName} · ${formatFileSize(source.fileSize)}`
    : source.label;
}

function SlowLoading() {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.1, ease: "easeOut" }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 px-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 backdrop-blur-[2px] [mask-image:linear-gradient(to_bottom,transparent_0%,#000_65%)]" />
        <div className="absolute inset-x-0 bottom-0 top-1/4 backdrop-blur-[5px] [mask-image:linear-gradient(to_bottom,transparent_0%,#000_60%)]" />
        <div className="absolute inset-x-0 bottom-0 top-1/2 backdrop-blur-[10px] [mask-image:linear-gradient(to_bottom,transparent_0%,#000_70%)]" />
        <div className="absolute inset-x-0 bottom-0 top-3/4 backdrop-blur-[16px]" />
      </div>

      <div className="relative flex flex-col items-center gap-3 text-center">
        <span
          aria-hidden="true"
          className="size-5 animate-spin rounded-full border-2 border-white/20 border-t-white/80"
        />
        <p className="max-w-[30ch] text-xs leading-relaxed text-white/75">
          O vídeo está sendo renderizado, aguarde alguns segundos.
        </p>
      </div>
    </motion.div>
  );
}

export function VideoPreview({
  source,
  onClear,
  onFormatChange,
  className,
}: VideoPreviewProps) {
  const reduceMotion = useReducedMotion();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  const key = sourceKey(source);
  const hasSource = Boolean(source);
  const embed =
    source && source.kind !== "file" && source.kind !== "upload"
      ? buildVideoEmbed(source)
      : null;
  const socialEmbed =
    embed && (source?.kind === "instagram" || source?.kind === "tiktok")
      ? embed
      : null;

  const [inView, setInView] = React.useState(false);
  const [readyKey, setReadyKey] = React.useState<string | null>(null);
  const [slowKey, setSlowKey] = React.useState<string | null>(null);
  const [failedKey, setFailedKey] = React.useState<string | null>(null);
  const [aspect, setAspect] = React.useState<{
    key: string;
    ratio: number;
    label: string;
  } | null>(null);
  const [expandedKey, setExpandedKey] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);

  const failed = failedKey === key && hasSource;
  const ready = readyKey === key && !failed;
  const slow = slowKey === key && !ready && !failed && inView;
  const expanded = expandedKey === key && hasSource;
  const activeAspect = aspect && aspect.key === key ? aspect : null;
  const ratio =
    activeAspect?.ratio ?? socialEmbed?.aspectRatio ?? DEFAULT_RATIO;
  const expandedRatio =
    socialEmbed?.aspectRatio ??
    (source && (source.kind === "file" || source.kind === "upload")
      ? ratio
      : 16 / 9);

  const formatRef = React.useRef(onFormatChange);
  React.useEffect(() => {
    formatRef.current = onFormatChange;
  }, [onFormatChange]);

  React.useEffect(() => {
    formatRef.current?.(
      aspect && aspect.key === key ? aspect.label : null
    );
  }, [aspect, key]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      const timer = window.setTimeout(() => setInView(true), 0);
      return () => window.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!hasSource || ready || !inView) return;

    const timer = window.setTimeout(() => setSlowKey(key), SLOW_LOAD_MS);
    return () => window.clearTimeout(timer);
  }, [hasSource, ready, inView, key]);

  const markReady = React.useCallback(() => {
    setReadyKey(key);
  }, [key]);

  const markFailed = React.useCallback(() => {
    setFailedKey(key);
  }, [key]);

  const handleAspectRatio = React.useCallback(
    (width: number, height: number) => {
      const next = describeAspect(width, height);
      setAspect(next ? { key, ...next } : null);
    },
    [key]
  );

  const closeExpanded = React.useCallback(() => {
    setExpandedKey(null);
  }, []);

  React.useEffect(() => {
    if (!expanded) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeExpanded();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const focusTimer = window.setTimeout(
      () => closeButtonRef.current?.focus(),
      80
    );

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [expanded, closeExpanded]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-hidden rounded-[1.75rem] border border-black/15 bg-[#161310] shadow-2xl shadow-black/20",
        className
      )}
    >
      <div
        className="relative max-h-[76dvh] w-full overflow-hidden bg-[#161310]"
        style={{ aspectRatio: ratio }}
      >
        {!source && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 overflow-hidden bg-[#09090b] ${className}`.trim()}
          >
            <div className="absolute inset-0 bg-[radial-gradient(110%_80%_at_50%_0%,#18181b_0%,#09090b_60%,#020203_100%)]" />
            <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000_60%,transparent_100%)]" />
            <div className="absolute left-1/2 top-0 h-48 w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-300/[0.04] blur-[100px]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent" />
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {source ? (
            inView ? (
              <motion.div
                key={key}
                initial={reduceMotion ? false : { opacity: 0, scale: 1.015 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="absolute inset-0"
              >
                <Media
                  source={source}
                  onReady={markReady}
                  onError={markFailed}
                  onAspectRatio={handleAspectRatio}
                  className="absolute inset-0"
                />
              </motion.div>
            ) : (
              <motion.div
                key="loading"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span
                  aria-hidden="true"
                  className="size-6 animate-spin rounded-full border-2 border-white/15 border-t-white/70"
                />
                <span className="sr-only">Carregando prévia do vídeo</span>
              </motion.div>
            )
          ) : (
            <motion.div
              key="empty"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
            >
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="animate-soft-pulse absolute inset-0 rounded-full bg-white/10 blur-2xl"
                />
                <span className="relative flex size-16 items-center justify-center rounded-[1.35rem]  text-white/80 backdrop-blur">
                  <Clapperboard className="size-7" />
                </span>
                <span className="absolute -bottom-2 -right-2 flex size-8 items-center justify-center rounded-full border border-white/15 bg-white text-foreground shadow-lg">
                  <Play className="ml-0.5 size-3.5 fill-current" />
                </span>
              </div>

              <p className="mt-7 text-lg font-medium tracking-tight text-white">
                Seu vídeo aparece aqui
              </p>
              <p className="mt-2 max-w-[26ch] text-sm leading-relaxed text-white/50">
                Cole o link ou envie um arquivo para conferir tudo antes de
                enviar o cadastro.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>{slow && <SlowLoading />}</AnimatePresence>

        {failed && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 px-6 text-center text-sm text-white/80">
            Este formato não abre no navegador, mas o arquivo será enviado
            normalmente.
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4">
          <div className="pointer-events-auto">
            {source && onClear && (
              <button
                type="button"
                onClick={onClear}
                aria-label="Remover vídeo da prévia"
                className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition-colors hover:bg-black/65 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {source && (
            <div className="pointer-events-auto flex items-center gap-2">
              <AnimatePresence>
                {ready && (
                  <motion.span
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="flex size-9 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/15 text-emerald-300 backdrop-blur-md"
                  >
                    <Check className="size-4" />
                    <span className="sr-only">Vídeo carregado</span>
                  </motion.span>
                )}
              </AnimatePresence>

              <button
                type="button"
                onClick={() => setExpandedKey(key)}
                aria-label="Ampliar prévia do vídeo"
                className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition-colors hover:bg-black/65 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                <Maximize2 className="size-4" />
              </button>
            </div>
          )}
        </div>

        <p className="sr-only" aria-live="polite">
          {source
            ? ready
              ? `Vídeo pronto: ${sourceDescription(source)}`
              : "Carregando vídeo"
            : ""}
        </p>
      </div>

      {source &&
        embed &&
        (source.kind === "instagram" || source.kind === "tiktok") && (
          <div className="bg-black px-4 py-3.5">
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Se a prévia não abrir, ver no {embed.provider}
            </a>
          </div>
        )}

      {!source && (
        <div className="bg-black px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                Aguardando vídeo
              </p>
              <p className="mt-1 truncate text-xs text-white/90">
                {`Link do YouTube, Vimeo, Instagram, TikTok ou arquivo até ${MAX_VIDEO_SIZE_MB} MB`}
              </p>
            </div>

            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/40"
            >
              <Link2 className="size-4" />
            </span>
          </div>
        </div>
      )}

      {mounted &&
        createPortal(
          <AnimatePresence>
            {expanded && source && (
              <motion.div
                key="expanded-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={closeExpanded}
                className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md sm:p-8"
              >
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Prévia ampliada do vídeo"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  onClick={(event) => event.stopPropagation()}
                  className="relative max-h-[86dvh] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
                  style={{
                    aspectRatio: expandedRatio,
                    width: `min(92vw, ${(86 * expandedRatio).toFixed(4)}dvh, 64rem)`,
                  }}
                >
                  <Media
                    source={source}
                    onReady={markReady}
                    onError={markFailed}
                    onAspectRatio={handleAspectRatio}
                    className="absolute inset-0"
                    autoPlay
                  />

                  {failed && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 px-6 text-center text-sm text-white/80">
                      Este formato não abre no navegador, mas o arquivo será
                      enviado normalmente.
                    </div>
                  )}

                  <div className="absolute inset-x-0 top-0 flex justify-end p-3">
                    <button
                      ref={closeButtonRef}
                      type="button"
                      onClick={closeExpanded}
                      aria-label="Fechar prévia ampliada"
                      className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
