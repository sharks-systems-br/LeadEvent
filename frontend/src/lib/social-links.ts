import { isWebUrl } from "@/lib/form-validation";

export type SocialPlatformId =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "x"
  | "facebook"
  | "linkedin"
  | "twitch"
  | "pinterest"
  | "threads"
  | "site";

export interface SocialPlatform {
  id: SocialPlatformId;
  label: string;
  prefix?: string;
  placeholder: string;
  color: string;
}

export const SOCIAL_PLATFORMS: readonly SocialPlatform[] = [
  {
    id: "instagram",
    label: "Instagram",
    prefix: "@",
    placeholder: "seu.perfil",
    color: "#E4405F",
  },
  {
    id: "tiktok",
    label: "TikTok",
    prefix: "@",
    placeholder: "seu.perfil",
    color: "#010101",
  },
  {
    id: "youtube",
    label: "YouTube",
    prefix: "@",
    placeholder: "seu.canal",
    color: "#FF0000",
  },
  {
    id: "x",
    label: "X (Twitter)",
    prefix: "@",
    placeholder: "seu_perfil",
    color: "#0F1419",
  },
  {
    id: "facebook",
    label: "Facebook",
    placeholder: "seu.perfil",
    color: "#1877F2",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    placeholder: "in/seu-perfil",
    color: "#0A66C2",
  },
  {
    id: "twitch",
    label: "Twitch",
    placeholder: "seu_canal",
    color: "#9146FF",
  },
  {
    id: "pinterest",
    label: "Pinterest",
    placeholder: "seu_perfil",
    color: "#BD081C",
  },
  {
    id: "threads",
    label: "Threads",
    prefix: "@",
    placeholder: "seu.perfil",
    color: "#111111",
  },
  {
    id: "site",
    label: "Site / Portfólio",
    placeholder: "seusite.com",
    color: "#2A1F18",
  },
];

export const MAX_SOCIAL_LINKS = 5;

export interface SocialLink {
  id: string;
  platform: SocialPlatformId | "";
  value: string;
}

export function createSocialLink(
  id: string,
  platform: SocialPlatformId | "" = "",
  value = ""
): SocialLink {
  return { id, platform, value };
}

export function createEmptySocialLinks(): SocialLink[] {
  return [createSocialLink("social-primary")];
}

export function getSocialPlatform(
  id: SocialPlatformId | ""
): SocialPlatform | undefined {
  return SOCIAL_PLATFORMS.find((platform) => platform.id === id);
}

const PLATFORM_HOSTS: Record<
  Exclude<SocialPlatformId, "site">,
  readonly string[]
> = {
  instagram: ["instagram.com", "instagr.am"],
  tiktok: ["tiktok.com"],
  youtube: ["youtube.com"],
  x: ["x.com", "twitter.com"],
  facebook: ["facebook.com", "fb.com", "fb.me"],
  linkedin: ["linkedin.com"],
  twitch: ["twitch.tv"],
  pinterest: ["pinterest.com", "pin.it"],
  threads: ["threads.net", "threads.com"],
};

const USERNAME_RE = /^[a-z0-9._-]{1,40}$/i;
const YOUTUBE_RE =
  /^(?:channel\/[a-z0-9_-]{6,}|c\/[a-z0-9._-]{2,}|user\/[a-z0-9._-]{2,}|[a-z0-9._-]{3,30})$/i;
const LINKEDIN_RE = /^(?:in|company|school)\/[a-z0-9._%-]{2,100}$/i;

function stripHost(value: string, hosts: readonly string[]): string {
  const lower = value.toLowerCase();

  for (const host of hosts) {
    const index = lower.indexOf(host);
    if (index === -1) continue;

    const after = value.slice(index + host.length);
    if (after === "" || /^[/?#]/.test(after)) {
      return after.replace(/^\/+/, "");
    }
  }

  return value;
}

export function normalizeSocialValue(
  platform: SocialPlatformId | "",
  input: string
): string {
  if (!platform) return input.trim();

  const raw = input.trim();
  if (!raw) return "";

  if (platform === "site") {
    return raw;
  }

  let value = raw
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "");

  value = stripHost(value, PLATFORM_HOSTS[platform]);
  value = value
    .replace(/[?#].*$/, "")
    .replace(/\/+$/, "")
    .replace(/^@/, "")
    .trim();

  if (platform === "linkedin") {
    if (value && !/^(?:in|company|school)\//i.test(value)) {
      value = `in/${value}`;
    }
    return value;
  }

  return value;
}

export function isSocialEntryEmpty(entry: SocialLink): boolean {
  return !entry.platform && !entry.value.trim();
}

export function isSocialEntryComplete(entry: SocialLink): boolean {
  return Boolean(entry.platform) && Boolean(entry.value.trim());
}

export function validateSocialEntry(entry: SocialLink): string | null {
  if (!entry.platform) {
    return entry.value.trim() ? "Escolha a rede social desta linha." : null;
  }

  if (!entry.value.trim()) {
    return "Informe o perfil ou o link.";
  }

  const value = normalizeSocialValue(entry.platform, entry.value);
  if (!value) return "Informe o perfil ou o link.";

  if (entry.platform === "site") {
    return isWebUrl(value)
      ? null
      : "Informe um site válido (ex.: seusite.com).";
  }

  if (entry.platform === "linkedin") {
    return LINKEDIN_RE.test(value)
      ? null
      : "Use o formato in/seu-perfil.";
  }

  if (entry.platform === "youtube") {
    return YOUTUBE_RE.test(value)
      ? null
      : "Use apenas o @ do canal ou o link completo.";
  }

  if (entry.platform === "facebook") {
    const reserved =
      /^(?:profile\.php|people|groups|watch|reel|reels|share|events|marketplace)$/i;
    if (value.includes("/") || reserved.test(value)) {
      return "Use o nome de usuário da página ou do perfil.";
    }
  }

  return USERNAME_RE.test(value)
    ? null
    : "Use apenas letras, números, pontos, hífens ou underlines.";
}

export function validateSocialLinks(links: SocialLink[]): string | null {
  const filled = links.filter((link) => !isSocialEntryEmpty(link));
  if (filled.length === 0) return null;

  const seen = new Set<string>();

  for (const link of filled) {
    const error = validateSocialEntry(link);
    if (error) return error;

    const key = `${link.platform}:${normalizeSocialValue(
      link.platform,
      link.value
    ).toLowerCase()}`;

    if (seen.has(key)) return "Você já adicionou esse perfil.";
    seen.add(key);
  }

  return null;
}

export function buildSocialUrl(entry: SocialLink): string | null {
  if (!entry.platform) return null;

  const value = normalizeSocialValue(entry.platform, entry.value);
  if (!value) return null;

  switch (entry.platform) {
    case "instagram":
      return `https://www.instagram.com/${value}`;
    case "tiktok":
      return `https://www.tiktok.com/@${value}`;
    case "youtube":
      return /^(?:channel|c|user)\//i.test(value)
        ? `https://www.youtube.com/${value}`
        : `https://www.youtube.com/@${value}`;
    case "x":
      return `https://x.com/${value}`;
    case "facebook":
      return `https://www.facebook.com/${value}`;
    case "linkedin":
      return `https://www.linkedin.com/${value}`;
    case "twitch":
      return `https://www.twitch.tv/${value}`;
    case "pinterest":
      return `https://www.pinterest.com/${value}`;
    case "threads":
      return `https://www.threads.net/@${value}`;
    case "site":
      return /^https?:\/\//i.test(value) ? value : `https://${value}`;
    default:
      return null;
  }
}

export function socialLinkDisplay(entry: SocialLink): string {
  const value = normalizeSocialValue(entry.platform, entry.value);
  if (!value) return "";

  if (
    entry.platform === "instagram" ||
    entry.platform === "tiktok" ||
    entry.platform === "x" ||
    entry.platform === "threads"
  ) {
    return `@${value}`;
  }

  if (entry.platform === "youtube") {
    return /^(?:channel|c|user)\//i.test(value) ? value : `@${value}`;
  }

  return value;
}

export function socialLinkLabel(entry: SocialLink): string {
  const platform = getSocialPlatform(entry.platform);
  const display = socialLinkDisplay(entry);

  if (!platform) return display;
  return display ? `${platform.label}: ${display}` : platform.label;
}
