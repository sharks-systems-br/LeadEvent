import {
  VIDEO_EXTENSION_REGEX,
  VIDEO_EXTENSIONS,
} from "./video-validation";

export { VIDEO_EXTENSIONS };

export const onlyDigits = (value: string) => value.replace(/\D+/g, "");

export function formatPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCNPJ(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
export const INSTAGRAM_RE = /^(?!\.)(?!.*\.\.)(?!.*\.$)[A-Za-z0-9._]{1,30}$/;
export const NAME_CHARS_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;
export const COMPANY_NAME_RE = /^[\p{L}\p{N}][\p{L}\p{N} &.'’()/-]{1,79}$/u;
export const DOMAIN_RE =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}(?:\/\S*)?$/i;

export function isValidFullName(value: string): boolean {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length < 3 || normalized.length > 80) return false;
  if (!NAME_CHARS_RE.test(normalized)) return false;
  return normalized.split(" ").length >= 2;
}

export function isValidCompanyName(value: string): boolean {
  return COMPANY_NAME_RE.test(value.trim());
}

export function isValidEmail(value: string): boolean {
  const normalized = value.trim();
  return normalized.length <= 254 && EMAIL_RE.test(normalized);
}

export function isValidPhone(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 10 && digits.length !== 11) return false;
  const ddd = Number(digits.slice(0, 2));
  return ddd >= 11 && ddd <= 99;
}

export function normalizeInstagram(value: string): string {
  const normalized = value
    .trim()
    .replace(/^(?:https?:\/\/)?(?:www\.)?instagram\.com\/?/i, "")
    .replace(/[/?#].*$/, "")
    .replace(/^@/, "");

  return normalized.toLowerCase() === "instagram.com" ? "" : normalized;
}

export function isValidInstagram(value: string): boolean {
  return INSTAGRAM_RE.test(normalizeInstagram(value));
}

export function isWebUrl(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return false;

  try {
    const url = new URL(
      /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`
    );
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname.includes(".")
    );
  } catch {
    return false;
  }
}

export function validateCompanySocial(value: string): string | null {
  const normalized = value.trim();

  if (!normalized) return "Informe o Instagram ou o site da empresa.";
  if (normalized.length > 120) return "Use no máximo 120 caracteres.";

  if (/instagram\.com/i.test(normalized)) {
    return isValidInstagram(normalized)
      ? null
      : "O perfil do Instagram parece inválido.";
  }

  if (normalized.startsWith("@")) {
    return INSTAGRAM_RE.test(normalized.slice(1))
      ? null
      : "Use apenas letras, números, pontos e underlines no @.";
  }

  if (/^https?:\/\//i.test(normalized)) {
    return isWebUrl(normalized)
      ? null
      : "Informe um endereço começando com https://.";
  }

  if (isWebUrl(normalized) || DOMAIN_RE.test(normalized)) return null;

  return "Use @usuario, www.suaempresa.com ou um link completo.";
}

export function isValidCNPJ(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const checkDigit = (base: string) => {
    let weight = base.length - 7;
    let sum = 0;

    for (const character of base) {
      sum += Number(character) * weight;
      weight -= 1;
      if (weight === 1) weight = 9;
    }

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return (
    checkDigit(digits.slice(0, 12)) === Number(digits[12]) &&
    checkDigit(digits.slice(0, 13)) === Number(digits[13])
  );
}

export type VideoLink =
  | { kind: "youtube"; id: string; label: string }
  | { kind: "vimeo"; id: string; label: string }
  | { kind: "instagram"; id: string; url: string; label: string }
  | {
      kind: "tiktok";
      id: string;
      url: string;
      label: string;
      needsResolution?: boolean;
    }
  | { kind: "file"; url: string; label: string };

export function parseVideoLink(value: string): VideoLink | null {
  const normalized = value.trim();
  if (!normalized) return null;

  let url: URL;
  try {
    url = new URL(
      /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`
    );
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  const path = url.pathname;

  if (host === "youtu.be") {
    const id = path.split("/").filter(Boolean)[0] ?? "";
    if (/^[A-Za-z0-9_-]{11}$/.test(id)) {
      return { kind: "youtube", id, label: "Link do YouTube" };
    }
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id =
      path === "/watch"
        ? url.searchParams.get("v") ?? ""
        : path.match(/^\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})/)?.[1] ??
          "";

    if (/^[A-Za-z0-9_-]{11}$/.test(id)) {
      return { kind: "youtube", id, label: "Link do YouTube" };
    }
  }

  if (host === "vimeo.com" || host.endsWith(".vimeo.com")) {
    const id = path.match(/^\/(?:video\/)?(\d{6,12})(?:\/|$)/)?.[1] ?? "";
    if (id) return { kind: "vimeo", id, label: "Link do Vimeo" };
  }

  if (host === "instagram.com" || host === "m.instagram.com") {
    const match = path.match(
      /^\/(?:[A-Za-z0-9._]+\/)?(p|reels?|tv)\/([A-Za-z0-9_-]+)/
    );

    if (match && match[2] !== "audio") {
      const [, rawType, id] = match;
      const type = rawType === "reels" ? "reel" : rawType;
      return {
        kind: "instagram",
        id,
        url: `https://www.instagram.com/${type}/${id}/`,
        label: "Link do Instagram",
      };
    }
  }

  if (
    host === "tiktok.com" ||
    host === "m.tiktok.com" ||
    host === "vm.tiktok.com" ||
    host === "vt.tiktok.com"
  ) {
    if (
      host === "vm.tiktok.com" ||
      host === "vt.tiktok.com" ||
      path.startsWith("/t/")
    ) {
      return {
        kind: "tiktok",
        id: "",
        url: url.toString(),
        label: "Link do TikTok",
        needsResolution: true,
      };
    }

    const full = path.match(/^\/@([^/]+)\/video\/(\d+)/);
    if (full) {
      const [, username, id] = full;
      return {
        kind: "tiktok",
        id,
        url: `https://www.tiktok.com/@${username}/video/${id}`,
        label: "Link do TikTok",
      };
    }

    const share = path.match(/^\/share\/video\/(\d+)/);
    if (share) {
      const [, id] = share;
      return {
        kind: "tiktok",
        id,
        url: `https://www.tiktok.com/player/v1/${id}`,
        label: "Link do TikTok",
      };
    }

    const player = path.match(/^\/player\/v1\/(\d+)/);
    if (player) {
      const [, id] = player;
      return {
        kind: "tiktok",
        id,
        url: `https://www.tiktok.com/player/v1/${id}`,
        label: "Link do TikTok",
      };
    }
  }

  if (VIDEO_EXTENSION_REGEX.test(path) && isWebUrl(url.toString())) {
    return { kind: "file", url: url.toString(), label: "Vídeo por link" };
  }

  return null;
}

export function isVideoFile(file: File): boolean {
  if (file.type.startsWith("video/")) return true;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return (VIDEO_EXTENSIONS as readonly string[]).includes(extension);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  const formatted = value >= 10 ? value.toFixed(0) : value.toFixed(1);
  return `${formatted.replace(".", ",")} ${units[index]}`;
}

