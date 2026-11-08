"use client";

import { parseVideoLink } from "@/lib/form-validation";
import { buildVideoEmbed, type VideoEmbed } from "@/lib/video-embeds";
import { cn } from "@/lib/utils";

type VideoSource =
  | {
      kind: "embed";
      src: string;
      allow: string;
      aspectRatio: number;
      href: string;
      provider: VideoEmbed["provider"];
    }
  | { kind: "file"; src: string }
  | { kind: "link"; src: string; label: string };

function getGoogleDriveFileId(value: string): string | null {
  try {
    const url = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`
    );

    if (
      url.hostname !== "drive.google.com" &&
      url.hostname !== "www.drive.google.com" &&
      url.hostname !== "docs.google.com"
    ) {
      return null;
    }

    return (
      url.pathname.match(/\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ??
      url.searchParams.get("id")?.match(/^[A-Za-z0-9_-]+$/)?.[0] ??
      null
    );
  } catch {
    return null;
  }
}

function resolveVideoSource(url: string): VideoSource {
  const link = parseVideoLink(url);

  if (link?.kind === "tiktok" && link.needsResolution) {
    return { kind: "link", src: link.url, label: "Abrir vídeo no TikTok" };
  }

  if (link && link.kind !== "file") {
    const embed = buildVideoEmbed(link, true);
    if (embed) {
      return {
        kind: "embed",
        src: embed.src,
        allow: embed.allow,
        aspectRatio: embed.aspectRatio,
        href: embed.href,
        provider: embed.provider,
      };
    }
  }

  const driveId = getGoogleDriveFileId(url);

  if (driveId) {
    return {
      kind: "embed",
      src: `https://drive.google.com/file/d/${driveId}/preview`,
      allow:
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
      aspectRatio: 16 / 9,
      href: `https://drive.google.com/file/d/${driveId}/view`,
      provider: "Google Drive",
    };
  }

  return { kind: "file", src: link?.kind === "file" ? link.url : url };
}

export function VideoPlayer({
  url,
  title = "Vídeo de apresentação",
  className,
}: {
  url: string;
  title?: string;
  className?: string;
}) {
  const source = resolveVideoSource(url);

  if (source.kind === "link") {
    return (
      <a
        href={source.src}
        target="_blank"
        rel="noreferrer"
        className="inline-flex text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {source.label}
      </a>
    );
  }

  if (source.kind === "embed") {
    const isDrive = source.src.includes("drive.google.com");

    return (
      <div className="-m-3 w-[calc(100%+1.5rem)] space-y-2">
        <iframe
          src={source.src}
          title={title}
          allow={source.allow}
          allowFullScreen
          style={{ aspectRatio: source.aspectRatio }}
          className={cn(
            "aspect-video h-auto w-full rounded-none border-0 bg-black",
            className
          )}
        />
        {isDrive && (
          <a
            href={source.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Se o vídeo não abrir, acesse no Google Drive
          </a>
        )}
        {(source.provider === "Instagram" || source.provider === "TikTok") && (
          <a
            href={source.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Abrir no {source.provider}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="-m-3 w-[calc(100%+1.5rem)] space-y-2">
      <video
        src={source.src}
        controls
        autoPlay
        playsInline
        preload="metadata"
        className={cn("max-h-[70vh] w-full rounded-none bg-black", className)}
      />
      <a
        href={source.src}
        target="_blank"
        rel="noreferrer"
        className="inline-flex text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Abrir vídeo em nova aba
      </a>
    </div>
  );
}
