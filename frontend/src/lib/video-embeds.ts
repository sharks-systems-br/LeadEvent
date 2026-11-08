import type { VideoLink } from "./form-validation";

export interface VideoEmbed {
  src: string;
  title: string;
  allow: string;
  aspectRatio: number;
  href: string;
  provider: "YouTube" | "Vimeo" | "Instagram" | "TikTok" | "Google Drive";
}

export function buildVideoEmbed(
  link: VideoLink,
  autoPlay = false
): VideoEmbed | null {
  if (link.kind === "youtube") {
    return {
      src: `https://www.youtube-nocookie.com/embed/${link.id}?rel=0&modestbranding=1&playsinline=1${autoPlay ? "&autoplay=1" : ""}`,
      title: "Prévia do vídeo do YouTube",
      allow:
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
      aspectRatio: 16 / 9,
      href: `https://www.youtube.com/watch?v=${link.id}`,
      provider: "YouTube",
    };
  }

  if (link.kind === "vimeo") {
    return {
      src: `https://player.vimeo.com/video/${link.id}?dnt=1&title=0&byline=0&portrait=0${autoPlay ? "&autoplay=1" : ""}`,
      title: "Prévia do vídeo do Vimeo",
      allow: "autoplay; fullscreen; picture-in-picture",
      aspectRatio: 16 / 9,
      href: `https://vimeo.com/${link.id}`,
      provider: "Vimeo",
    };
  }

  if (link.kind === "instagram") {
    const rawType =
      new URL(link.url).pathname.split("/").filter(Boolean)[0] ?? "p";
    const type = rawType === "reels" ? "reel" : rawType;
    const aspectRatio =
      type === "reel" ? 9 / 16 : type === "tv" ? 16 / 9 : 4 / 5;

    return {
      src: `https://www.instagram.com/${type}/${link.id}/embed/`,
      title: "Prévia do vídeo do Instagram",
      allow:
        "autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share",
      aspectRatio,
      href: link.url,
      provider: "Instagram",
    };
  }

  if (link.kind === "tiktok") {
    if (link.needsResolution || !link.id) return null;

    const params = new URLSearchParams({
      music_info: "1",
      description: "1",
    });

    if (autoPlay) {
      params.set("autoplay", "1");
      params.set("muted", "1");
    }

    return {
      src: `https://www.tiktok.com/player/v1/${link.id}?${params.toString()}`,
      title: "Prévia do vídeo do TikTok",
      allow:
        "accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share",
      aspectRatio: 9 / 16,
      href: link.url,
      provider: "TikTok",
    };
  }

  return null;
}

export async function resolveTikTokShortLink(
  url: string,
  signal?: AbortSignal
): Promise<VideoLink | null> {
  try {
    const response = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
      { signal }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as {
      embed_product_id?: string;
      author_url?: string;
      html?: string;
    };

    const htmlId = data.html?.match(/player\/v1\/(\d+)/)?.[1];
    const id = data.embed_product_id || htmlId || "";

    if (!/^\d{5,}$/.test(id)) return null;

    const authorUrl = data.author_url?.replace(/\/+$/, "");
    const canonical = authorUrl
      ? `${authorUrl}/video/${id}`
      : `https://www.tiktok.com/player/v1/${id}`;

    return {
      kind: "tiktok",
      id,
      url: canonical,
      label: "Link do TikTok",
    };
  } catch {
    return null;
  }
}
