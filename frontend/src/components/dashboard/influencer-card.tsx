"use client";

import { useCallback, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  AtSign,
  MapPin,
  Phone,
  VideoOff,
} from "lucide-react";
import { LeadDetailModal } from "@/components/dashboard/lead-detail-modal";
import { VideoPlayer } from "@/components/dashboard/video-player";
import { formatDateTime } from "@/lib/api/dashboard";
import {
  FOLLOWER_RANGE_LABELS,
  SOCIAL_MEDIA_LABELS,
  type InfluencerRecord,
} from "@/lib/api/dashboard";
import { formatPhone, onlyDigits } from "@/lib/form-validation";

function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
      <dt className="text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-white/80">{children}</dd>
    </div>
  );
}

function NoVideo() {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] text-white/40">
      <VideoOff className="size-6" />
      <span className="text-xs">Nenhum vídeo enviado</span>
    </div>
  );
}

function InfluencerDetail({ influencer }: { influencer: InfluencerRecord }) {
  const instagramUrl = `https://instagram.com/${influencer.instagram}`;
  const whatsappUrl = `https://wa.me/55${onlyDigits(influencer.phone)}`;
  const location = [influencer.city, influencer.state].filter(Boolean).join(", ");

  return (
    <div className="flex min-h-full flex-col">
      <span className="inline-flex w-fit items-center rounded-full bg-brand/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
        Influencer
      </span>

      <h2 className="mt-3 pr-10 text-2xl font-semibold tracking-tight sm:text-3xl">
        {influencer.name}
      </h2>
      <a
        href={instagramUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
      >
        <AtSign className="size-3.5" />
        {influencer.instagram}
      </a>

      <dl className="mt-6 grid gap-2.5 text-left sm:grid-cols-2">
        <DetailField label="Localização">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0 text-white/40" />
            {location || "Não informado"}
          </span>
        </DetailField>

        <DetailField label="Telefone">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <Phone className="size-3.5 shrink-0 text-white/40" />
            {formatPhone(influencer.phone)}
          </a>
        </DetailField>

        <DetailField label="Nicho">{influencer.niche}</DetailField>

        <DetailField label="Seguidores">
          {FOLLOWER_RANGE_LABELS[influencer.followerRange]}
        </DetailField>
      </dl>

      <div className="mt-6">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
          Por que quer participar
        </h3>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/75">
          {influencer.reason}
        </p>
      </div>

      {influencer.socialMedias.length > 0 && (
        <div className="mt-6">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
            Outras redes
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {influencer.socialMedias.map((social) => (
              <a
                key={`${social.socialMedia}-${social.link}`}
                href={social.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                {SOCIAL_MEDIA_LABELS[social.socialMedia]}
              </a>
            ))}
          </div>
        </div>
      )}

      <p className="mt-auto border-t border-white/10 pt-4 text-[11px] text-white/35 sm:mt-8">
        Cadastro recebido em {formatDateTime(influencer.createdAt)}
      </p>
    </div>
  );
}

export function InfluencerCard({
  influencer,
  actions,
}: {
  influencer: InfluencerRecord;
  actions?: ReactNode;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const closeDetails = useCallback(() => setDetailsOpen(false), []);

  const instagramUrl = `https://instagram.com/${influencer.instagram}`;
  const whatsappUrl = `https://wa.me/55${onlyDigits(influencer.phone)}`;
  const location = [influencer.city, influencer.state].filter(Boolean).join(", ");

  return (
    <article className="flex h-full flex-col rounded-2xl border border-black/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">
            {influencer.name}
          </h3>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <AtSign className="size-3.5 shrink-0" />
            <span className="truncate">{influencer.instagram}</span>
          </a>
        </div>
        <time className="shrink-0 rounded-full bg-black/[0.04] px-2 py-1 text-[10px] font-medium text-muted-foreground">
          {formatDateTime(influencer.createdAt)}
        </time>
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[11px] font-medium text-foreground/80">
          {influencer.niche}
        </span>
        <span className="rounded-full border border-black/[0.08] px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          {FOLLOWER_RANGE_LABELS[influencer.followerRange]}
        </span>
      </div>

      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{location}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="size-3.5 shrink-0" />
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="truncate transition-colors hover:text-foreground"
          >
            {formatPhone(influencer.phone)}
          </a>
        </div>
      </dl>

      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {influencer.reason}
      </p>

      <button
        type="button"
        onClick={() => setDetailsOpen(true)}
        className="mt-2 inline-flex w-fit items-center gap-1 text-xs font-semibold text-foreground underline-offset-4 transition-colors hover:text-brand hover:underline"
      >
        Ver mais
        <ArrowUpRight className="size-3.5" />
      </button>

      {influencer.socialMedias.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {influencer.socialMedias.map((social) => (
            <a
              key={`${social.socialMedia}-${social.link}`}
              href={social.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-black/[0.03]"
            >
              {SOCIAL_MEDIA_LABELS[social.socialMedia]}
            </a>
          ))}
        </div>
      )}

      {actions && <div className="mt-auto pt-4">{actions}</div>}

      {detailsOpen && (
        <LeadDetailModal
          label={`Detalhes de ${influencer.name}`}
          media={
            influencer.videoUrl ? (
              <VideoPlayer
                url={influencer.videoUrl}
                title={`Vídeo de ${influencer.name}`}
                className="max-h-[60vh] md:max-h-[72vh]"
              />
            ) : (
              <NoVideo />
            )
          }
          onClose={closeDetails}
        >
          <InfluencerDetail influencer={influencer} />
        </LeadDetailModal>
      )}
    </article>
  );
}
