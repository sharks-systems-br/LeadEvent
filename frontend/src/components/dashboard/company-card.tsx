"use client";

import { useCallback, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  AtSign,
  Building2,
  Clock,
  Mail,
  User,
} from "lucide-react";
import { LeadDetailModal } from "@/components/dashboard/lead-detail-modal";
import { formatCNPJ } from "@/lib/form-validation";
import {
  DISPONIBILITY_LABELS,
  formatDateTime,
  type CompanyRecord,
} from "@/lib/api/dashboard";

function socialProfileUrl(value: string) {
  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("@")) return `https://instagram.com/${trimmed.slice(1)}`;
  if (/^[\w.-]+\.[a-z]{2,}/i.test(trimmed)) return `https://${trimmed}`;

  return null;
}

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
      <dd className="mt-1 break-words text-sm text-white/80">{children}</dd>
    </div>
  );
}

function CompanyDetail({ company }: { company: CompanyRecord }) {
  const socialUrl = socialProfileUrl(company.socialMedia);

  return (
    <div className="flex min-h-full flex-col">
      <span className="inline-flex w-fit items-center rounded-full bg-brand/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand">
        Empresa
      </span>

      <h2 className="mt-3 pr-10 text-2xl font-semibold tracking-tight sm:text-3xl">
        {company.tradeName}
      </h2>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-white/60">
        <User className="size-3.5 shrink-0" />
        {company.personName}
      </p>

      <dl className="mt-6 grid gap-2.5 text-left sm:grid-cols-2">
        <DetailField label="E-mail de contato">
          <a
            href={`mailto:${company.contactEmail}`}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <Mail className="size-3.5 shrink-0 text-white/40" />
            {company.contactEmail}
          </a>
        </DetailField>

        <DetailField label="CNPJ">
          <span className="inline-flex items-center gap-1.5">
            <Building2 className="size-3.5 shrink-0 text-white/40" />
            {formatCNPJ(company.cnpj)}
          </span>
        </DetailField>

        <DetailField label="Instagram ou site">
          <span className="inline-flex items-center gap-1.5">
            <AtSign className="size-3.5 shrink-0 text-white/40" />
            {socialUrl ? (
              <a
                href={socialUrl}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-white"
              >
                {company.socialMedia}
              </a>
            ) : (
              company.socialMedia
            )}
          </span>
        </DetailField>

        <DetailField label="Disponibilidade para reunião">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0 text-white/40" />
            {DISPONIBILITY_LABELS[company.disponibility]}
          </span>
        </DetailField>
      </dl>

      {company.partnershipFormats.length > 0 && (
        <div className="mt-6">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
            Formatos de parceria
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {company.partnershipFormats.map((format) => (
              <span
                key={format.format}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/70"
              >
                {format.format}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
          Motivo do patrocínio
        </h3>
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/75">
          {company.reason}
        </p>
      </div>

      <p className="mt-auto border-t border-white/10 pt-4 text-[11px] text-white/35 sm:mt-8">
        Cadastro recebido em {formatDateTime(company.createdAt)}
      </p>
    </div>
  );
}

export function CompanyCard({
  company,
  actions,
}: {
  company: CompanyRecord;
  actions?: ReactNode;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const closeDetails = useCallback(() => setDetailsOpen(false), []);

  const socialUrl = socialProfileUrl(company.socialMedia);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-black/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">
            {company.tradeName}
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="size-3.5 shrink-0" />
            <span className="truncate">{company.personName}</span>
          </p>
        </div>
        <time className="shrink-0 rounded-full bg-black/[0.04] px-2 py-1 text-[10px] font-medium text-muted-foreground">
          {formatDateTime(company.createdAt)}
        </time>
      </header>

      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="size-3.5 shrink-0" />
          <a
            href={`mailto:${company.contactEmail}`}
            className="truncate transition-colors hover:text-foreground"
          >
            {company.contactEmail}
          </a>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="size-3.5 shrink-0" />
          <span>CNPJ {formatCNPJ(company.cnpj)}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <AtSign className="size-3.5 shrink-0" />
          {socialUrl ? (
            <a
              href={socialUrl}
              target="_blank"
              rel="noreferrer"
              className="truncate transition-colors hover:text-foreground"
            >
              {company.socialMedia}
            </a>
          ) : (
            <span className="truncate">{company.socialMedia}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="size-3.5 shrink-0" />
          <span>{DISPONIBILITY_LABELS[company.disponibility]}</span>
        </div>
      </dl>

      {company.partnershipFormats.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {company.partnershipFormats.map((format) => (
            <span
              key={format.format}
              className="rounded-full border border-black/[0.08] bg-black/[0.03] px-2.5 py-1 text-[11px] font-medium text-foreground/80"
            >
              {format.format}
            </span>
          ))}
        </div>
      )}

      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {company.reason}
      </p>

      <button
        type="button"
        onClick={() => setDetailsOpen(true)}
        className="mt-2 inline-flex w-fit items-center gap-1 text-xs font-semibold text-foreground underline-offset-4 transition-colors hover:text-brand hover:underline"
      >
        Ver mais
        <ArrowUpRight className="size-3.5" />
      </button>

      {actions && <div className="mt-auto pt-4">{actions}</div>}

      {detailsOpen && (
        <LeadDetailModal
          label={`Detalhes de ${company.tradeName}`}
          onClose={closeDetails}
        >
          <CompanyDetail company={company} />
        </LeadDetailModal>
      )}
    </article>
  );
}
