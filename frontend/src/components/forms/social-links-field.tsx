"use client";

import * as React from "react";
import { Check, Pencil, Plus, X } from "lucide-react";
import { SelectInput, TextInput } from "@/components/forms/form-controls";
import { SocialGlyph } from "@/components/forms/social-icons";
import { cn } from "@/lib/utils";
import {
  MAX_SOCIAL_LINKS,
  SOCIAL_PLATFORMS,
  buildSocialUrl,
  createEmptySocialLinks,
  createSocialLink,
  getSocialPlatform,
  isSocialEntryComplete,
  isSocialEntryEmpty,
  normalizeSocialValue,
  socialLinkDisplay,
  socialLinkLabel,
  validateSocialEntry,
  type SocialLink,
  type SocialPlatformId,
} from "@/lib/social-links";

interface SocialLinksFieldProps {
  id: string;
  value: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

export function SocialLinksField({
  id,
  value,
  onChange,
}: SocialLinksFieldProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [rowErrors, setRowErrors] = React.useState<Record<string, string>>({});
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [focusId, setFocusId] = React.useState<string | null>(null);
  const counterRef = React.useRef(1);

  const rows = value.length > 0 ? value : createEmptySocialLinks();

  const links = React.useMemo(
    () =>
      value.flatMap((entry) => {
        if (!isSocialEntryComplete(entry)) return [];

        const url = buildSocialUrl(entry);
        if (!url) return [];

        return [
          {
            entry,
            url,
            label: socialLinkLabel(entry),
            display: socialLinkDisplay(entry),
          },
        ];
      }),
    [value]
  );

  const isCollapsed = collapsed && links.length > 0;

  const updateRow = (rowId: string, patch: Partial<SocialLink>) => {
    onChange(
      rows.map((row) => (row.id === rowId ? { ...row, ...patch } : row))
    );
    setGeneralError(null);
    setRowErrors((previous) => {
      if (!previous[rowId]) return previous;
      const next = { ...previous };
      delete next[rowId];
      return next;
    });
  };

  const addRow = () => {
    if (rows.length >= MAX_SOCIAL_LINKS) return;

    const rowId = `social-${counterRef.current++}`;
    onChange([...rows, createSocialLink(rowId)]);
    setFocusId(rowId);
  };

  const removeRow = (rowId: string) => {
    const remaining = rows.filter((row) => row.id !== rowId);
    onChange(remaining.length > 0 ? remaining : createEmptySocialLinks());

    setGeneralError(null);
    setRowErrors((previous) => {
      if (!previous[rowId]) return previous;
      const next = { ...previous };
      delete next[rowId];
      return next;
    });
  };

  const handleDone = () => {
    const nextErrors: Record<string, string> = {};
    const seen = new Set<string>();

    for (const row of rows) {
      if (isSocialEntryEmpty(row)) continue;

      const error = validateSocialEntry(row);
      if (error) {
        nextErrors[row.id] = error;
        continue;
      }

      const key = `${row.platform}:${normalizeSocialValue(
        row.platform,
        row.value
      ).toLowerCase()}`;

      if (seen.has(key)) {
        nextErrors[row.id] = "Você já adicionou esse perfil.";
      }
      seen.add(key);
    }

    if (Object.keys(nextErrors).length > 0) {
      setRowErrors(nextErrors);
      setGeneralError(null);
      return;
    }

    const filled = rows.filter((row) => !isSocialEntryEmpty(row));

    if (filled.length === 0) {
      setGeneralError(
        "Adicione ao menos uma rede social ou deixe este campo em branco."
      );
      return;
    }

    onChange(
      filled.map((row) => ({
        ...row,
        value: normalizeSocialValue(row.platform, row.value),
      }))
    );
    setRowErrors({});
    setGeneralError(null);
    setCollapsed(true);
  };

  const handleEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (rows.length < MAX_SOCIAL_LINKS) addRow();
  };

  if (isCollapsed) {
    return (
      <div
        id={id}
        tabIndex={-1}
        className="flex flex-wrap items-center gap-3 rounded-xl border border-black/10 bg-white/70 p-3"
      >
        <ul className="flex flex-wrap items-center gap-2.5">
          {links.map(({ entry, url, label, display }) => {
            const platform = getSocialPlatform(entry.platform);
            if (!platform) return null;

            return (
              <li key={entry.id} className="animate-in fade-in zoom-in-95 duration-300">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} (abre em nova aba)`}
                  title={`${label}${display ? ` — ${display}` : ""}`}
                  className="flex size-12 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-black/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/10"
                  style={{ color: platform.color }}
                >
                  <SocialGlyph platform={platform.id} className="size-5" />
                </a>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 text-xs font-semibold text-foreground transition hover:border-black/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
        >
          <Pencil className="size-3.5" />
          Editar
        </button>
      </div>
    );
  }

  return (
    <div
      id={id}
      tabIndex={-1}
      className="space-y-2.5 rounded-xl outline-none"
    >
      <div className="space-y-2.5">
        {rows.map((entry, index) => {
          const platform = getSocialPlatform(entry.platform);
          const rowError = rowErrors[entry.id];
          const canRemove = rows.length > 1 || !isSocialEntryEmpty(entry);

          return (
            <div key={entry.id} className="space-y-1.5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-2 sm:grid-cols-[8.5rem_minmax(0,1fr)_auto_auto]">
                <div className="col-span-3 min-w-0 sm:col-span-1">
                  <SelectInput
                    id={`${entry.id}-platform`}
                    name={`socials[${index}].platform`}
                    aria-label={`Rede social ${index + 1}`}
                    value={entry.platform}
                    onChange={(event) =>
                      updateRow(entry.id, {
                        platform: event.target.value as SocialPlatformId | "",
                        value: event.target.value
                          ? normalizeSocialValue(
                              event.target.value as SocialPlatformId,
                              entry.value
                            )
                          : entry.value,
                      })
                    }
                    onKeyDown={handleEnter}
                    placeholder="Rede"
                    autoFocus={entry.id === focusId}
                    className="h-12"
                  >
                    {SOCIAL_PLATFORMS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </SelectInput>
                </div>

                <TextInput
                  id={`${entry.id}-value`}
                  name={`socials[${index}].value`}
                  aria-label={`Perfil na rede social ${index + 1}`}
                  value={entry.value}
                  onChange={(event) =>
                    updateRow(entry.id, { value: event.target.value })
                  }
                  onBlur={(event) => {
                    if (!entry.platform) return;
                    const normalized = normalizeSocialValue(
                      entry.platform,
                      event.target.value
                    );
                    if (normalized !== entry.value) {
                      updateRow(entry.id, { value: normalized });
                    }
                  }}
                  onKeyDown={handleEnter}
                  placeholder={
                    platform?.placeholder ?? "Perfil ou link"
                  }
                  leading={platform?.prefix}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoComplete="off"
                  maxLength={120}
                />

                {index === rows.length - 1 ? (
                  <button
                    type="button"
                    onClick={addRow}
                    disabled={rows.length >= MAX_SOCIAL_LINKS}
                    aria-label="Adicionar outra rede social"
                    title={
                      rows.length >= MAX_SOCIAL_LINKS
                        ? `Máximo de ${MAX_SOCIAL_LINKS} redes`
                        : "Adicionar outra rede social"
                    }
                    className={cn(
                      "inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-dashed border-black/20 bg-white text-muted-foreground transition",
                      "hover:border-black/40 hover:text-foreground hover:shadow-sm",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/[0.05]",
                      "disabled:pointer-events-none disabled:border-black/10 disabled:opacity-40"
                    )}
                  >
                    <Plus className="size-4" />
                  </button>
                ) : (
                  <span aria-hidden="true" className="size-12" />
                )}
                <button
                  type="button"
                  onClick={() => removeRow(entry.id)}
                  disabled={!canRemove}
                  aria-label="Remover esta rede social"
                  title="Remover"
                  className={cn(
                    "inline-flex size-12 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white text-muted-foreground transition",
                    "hover:border-red-200 hover:bg-red-50 hover:text-red-600",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/10",
                    "disabled:pointer-events-none disabled:opacity-30"
                  )}
                >
                  <X className="size-4" />
                </button>
              </div>

              {rowError && (
                <p role="alert" className="text-xs font-medium text-red-600">
                  {rowError}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] text-muted-foreground">
          {rows.length >= MAX_SOCIAL_LINKS
            ? `Limite de ${MAX_SOCIAL_LINKS} redes atingido.`
            : `Adicione até ${MAX_SOCIAL_LINKS} perfis, um por linha.`}
        </p>

        <button
          type="button"
          onClick={handleDone}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-xs font-semibold text-background transition hover:bg-black hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 active:scale-[0.99]"
        >
          <Check className="size-3.5" />
          Concluir
        </button>
      </div>

      {generalError && (
        <p
          role="status"
          data-social-feedback=""
          className="text-[11px] font-medium text-muted-foreground"
        >
          {generalError}
        </p>
      )}
    </div>
  );
}
