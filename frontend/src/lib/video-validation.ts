export const MAX_VIDEO_SIZE_MB = 120;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
export const MAX_VIDEO_DURATION_SECONDS = 120;

export const VIDEO_EXTENSIONS = [
  "mp4",
  "m4v",
  "mov",
  "webm",
  "mkv",
  "avi",
  "wmv",
  "asf",
  "flv",
  "mpg",
  "mpeg",
  "mpe",
  "m1v",
  "m2v",
  "mpv",
  "ts",
  "mts",
  "m2ts",
  "3gp",
  "3g2",
  "ogv",
  "ogg",
  "f4v",
] as const;

export const VIDEO_EXTENSION_REGEX =
  /\.(mp4|m4v|mov|webm|mkv|avi|wmv|asf|flv|mpg|mpeg|mpe|m1v|m2v|mpv|ts|mts|m2ts|3gp|3g2|ogv|ogg|f4v)$/i;

export const VIDEO_ACCEPT =
  "video/*,.mp4,.m4v,.mov,.webm,.mkv,.avi,.wmv,.asf,.flv,.mpg,.mpeg,.mpe,.m1v,.m2v,.mpv,.ts,.mts,.m2ts,.3gp,.3g2,.ogv,.ogg,.f4v";

const BROWSER_PLAYABLE_EXTENSIONS = [
  "mp4",
  "m4v",
  "mov",
  "webm",
  "ogv",
  "ogg",
] as const;

const BROWSER_PLAYABLE_MIME_TYPES = [
  "video/mp4",
  "video/x-m4v",
  "video/quicktime",
  "video/webm",
  "video/ogg",
] as const;

export function isBrowserPlayableVideo(file: File): boolean {
  const dotIndex = file.name.lastIndexOf(".");
  const extension =
    dotIndex >= 0 ? file.name.slice(dotIndex + 1).toLowerCase() : "";

  return (
    (BROWSER_PLAYABLE_EXTENSIONS as readonly string[]).includes(extension) ||
    (BROWSER_PLAYABLE_MIME_TYPES as readonly string[]).includes(file.type)
  );
}

const METADATA_TIMEOUT_MS = 12000;

export interface VideoMetadata {
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
}

const UNKNOWN_METADATA: VideoMetadata = {
  durationSeconds: null,
  width: null,
  height: null,
};

export function formatVideoDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export function readVideoMetadata(
  file: File,
  signal?: AbortSignal
): Promise<VideoMetadata> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve(UNKNOWN_METADATA);
      return;
    }

    const url = URL.createObjectURL(file);
    const element = document.createElement("video");
    let settled = false;
    let timeoutId = 0;

    const handleAbort = () => finish(UNKNOWN_METADATA);

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", handleAbort);
      element.removeEventListener("loadedmetadata", handleLoaded);
      element.removeEventListener("error", handleError);
      element.removeAttribute("src");
      element.load();
      URL.revokeObjectURL(url);
    };

    const finish = (metadata: VideoMetadata) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(metadata);
    };

    const handleLoaded = () => {
      const duration = element.duration;

      finish({
        durationSeconds:
          Number.isFinite(duration) && duration > 0 ? duration : null,
        width: element.videoWidth || null,
        height: element.videoHeight || null,
      });
    };

    const handleError = () => finish(UNKNOWN_METADATA);

    timeoutId = window.setTimeout(
      () => finish(UNKNOWN_METADATA),
      METADATA_TIMEOUT_MS
    );

    element.preload = "metadata";
    element.muted = true;
    element.playsInline = true;
    element.addEventListener("loadedmetadata", handleLoaded);
    element.addEventListener("error", handleError);
    signal?.addEventListener("abort", handleAbort);
    element.src = url;
  });
}
