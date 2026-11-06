"use client";

import { parseVideoLink } from "@/lib/form-validation";
import { cn } from "@/lib/utils";

type VideoSource =
  | { kind: "embed"; src: string }
  | { kind: "file"; src: string };

function resolveVideoSource(url: string): VideoSource {
  const link = parseVideoLink(url);

  if (link?.kind === "youtube") {
    return {
      kind: "embed",
      src: `https://www.youtube.com/embed/${link.id}?autoplay=1&rel=0`,
    };
  }

  if (link?.kind === "vimeo") {
    return {
      kind: "embed",
      src: `https://player.vimeo.com/video/${link.id}?autoplay=1`,
    };
  }

  const driveId = url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)?.[1];

  if (driveId) {
    return {
      kind: "embed",
      src: `https://drive.google.com/file/d/${driveId}/preview`,
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

  if (source.kind === "embed") {
    return (
      <iframe
        src={source.src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className={cn(
          "aspect-video w-full rounded-2xl border-0 bg-black",
          className
        )}
      />
    );
  }

  return (
    <video
      src={source.src}
      controls
      autoPlay
      playsInline
      preload="metadata"
      className={cn("max-h-[70vh] w-full rounded-2xl bg-black", className)}
    />
  );
}
