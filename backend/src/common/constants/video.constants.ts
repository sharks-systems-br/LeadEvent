export const MAX_VIDEO_SIZE_BYTES = 120 * 1024 * 1024;

export const MAX_VIDEO_DURATION_SECONDS = 120;

export const ACCEPTED_VIDEO_EXTENSIONS = [
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

export const ACCEPTED_VIDEO_MIME_TYPES = new Set([
    "video/mp4",
    "video/x-m4v",
    "video/quicktime",
    "video/webm",
    "video/matroska",
    "video/x-matroska",
    "video/vnd.avi",
    "video/x-msvideo",
    "video/x-ms-asf",
    "application/vnd.ms-asf",
    "video/x-ms-wmv",
    "video/x-flv",
    "video/mpeg",
    "video/mp2t",
    "video/3gpp",
    "video/3gpp2",
    "video/ogg",
    "application/ogg",
    "video/mp1s",
    "video/mp2p",
]);

export function getVideoExtension(filename: string): string {
    if (!filename) return "";

    const lastDot = filename.lastIndexOf(".");
    if (lastDot === -1 || lastDot === filename.length - 1) return "";

    return filename.slice(lastDot + 1).toLowerCase();
}

export function isAcceptedVideoUpload(mimetype: string, filename: string): boolean {
    const normalizedMime = (mimetype ?? "").trim().toLowerCase();

    if (normalizedMime.startsWith("video/") || ACCEPTED_VIDEO_MIME_TYPES.has(normalizedMime)) {
        return true;
    }

    const extension = getVideoExtension(filename);
    return (ACCEPTED_VIDEO_EXTENSIONS as readonly string[]).includes(extension);
}
