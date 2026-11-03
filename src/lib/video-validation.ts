export const MAX_VIDEO_SIZE_MB = 80;
export const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
export const MAX_VIDEO_DURATION_SECONDS = 120;

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
