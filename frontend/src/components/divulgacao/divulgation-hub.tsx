"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  extractInstagramUsername,
  normalizeWhatsAppNumber,
} from "@/lib/lead-notifications";

type Audience = "influencer" | "company";
type Channel = "whatsapp" | "instagram" | "none";

interface Guest {
  id: string;
  name: string;
  instagram: string;
  phone: string;
  audience: Audience;
  sent: boolean;
}

const STORAGE_KEY = "leadevent:divulgacao:guests";
const DEFAULT_ORIGIN = "https://lead-event-beige.vercel.app";
const EVENT_DATE = "22 de novembro";

const AUDIENCES: { id: Audience; label: string; path: string }[] = [
  { id: "influencer", label: "Influenciador", path: "/influencer" },
  { id: "company", label: "Empresa", path: "/empresa" },
];

function qrApiUrl(value: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=16&data=${encodeURIComponent(
    value
  )}`;
}

function createGuestId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function inviteMessage(audience: Audience, name: string, link: string) {
  const greeting = name.trim() ? `Oi, ${name.trim()}!` : "Oi!";

  if (audience === "influencer") {
    return `${greeting} Você está convidado(a) para a Feijoada dos Influenciadores, no dia ${EVENT_DATE}. Faça sua inscrição por aqui: ${link}`;
  }

  return `${greeting} Convido você para conhecer as cotas de patrocínio da Feijoada dos Influenciadores, no dia ${EVENT_DATE}. Veja os formatos e inscreva-se: ${link}`;
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus-visible:border-foreground/40 focus-visible:ring-2 focus-visible:ring-foreground/10";

export function DivulgationHub() {
  const [audience, setAudience] = useState<Audience>("influencer");
  const [baseUrl, setBaseUrl] = useState(DEFAULT_ORIGIN);
  const [source, setSource] = useState("instagram");
  const [medium, setMedium] = useState("story");
  const [campaign, setCampaign] = useState("feijoada-4");

  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [qrStatus, setQrStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const qrObjectUrlRef = useRef<string | null>(null);

  const [guestName, setGuestName] = useState("");
  const [guestInstagram, setGuestInstagram] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const [guests, setGuests] = useState<Guest[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);

  const link = useMemo(() => {
    const base = baseUrl.trim().replace(/\/+$/, "") || DEFAULT_ORIGIN;
    const path = AUDIENCES.find((item) => item.id === audience)?.path ?? "/influencer";
    const params = new URLSearchParams();

    if (source.trim()) params.set("utm_source", source.trim());
    if (medium.trim()) params.set("utm_medium", medium.trim());
    if (campaign.trim()) params.set("utm_campaign", campaign.trim());

    const query = params.toString();
    return `${base}${path}${query ? `?${query}` : ""}`;
  }, [audience, baseUrl, source, medium, campaign]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setQrStatus("loading");

      try {
        const response = await fetch(qrApiUrl(link));
        if (!response.ok) throw new Error("qr");

        const blob = await response.blob();
        if (cancelled) return;

        if (qrObjectUrlRef.current) URL.revokeObjectURL(qrObjectUrlRef.current);
        qrObjectUrlRef.current = URL.createObjectURL(blob);
        setQrSrc(qrObjectUrlRef.current);
        setQrStatus("ready");
      } catch {
        if (cancelled) return;
        setQrSrc(qrApiUrl(link));
        setQrStatus("error");
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [link]);

  useEffect(() => {
    return () => {
      if (qrObjectUrlRef.current) URL.revokeObjectURL(qrObjectUrlRef.current);
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Guest[];
      if (Array.isArray(parsed)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setGuests(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function showNotice(message: string) {
    setNotice(message);
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(null), 4000);
  }

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(
        () => setCopiedKey((current) => (current === key ? null : current)),
        2000
      );
    } catch {
      showNotice("Não foi possível copiar. Copie manualmente.");
    }
  }

  async function shareText(key: string, title: string, text: string) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: link });
        return;
      } catch {
        return;
      }
    }

    await copyText(key, text);
    showNotice("Compartilhamento indisponível: texto copiado.");
  }

  function persist(next: Guest[]) {
    setGuests(next);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      showNotice("Não foi possível salvar a lista neste navegador.");
    }
  }

  function openConversation(
    phone: string,
    instagram: string,
    message: string
  ): Channel {
    const number = normalizeWhatsAppNumber(phone);

    if (number) {
      window.open(
        `https://wa.me/${number}?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer"
      );
      return "whatsapp";
    }

    const username = extractInstagramUsername(instagram);
    if (!username) return "none";

    const copy = navigator.clipboard.writeText(message);
    window.open(
      `https://ig.me/m/${username}`,
      "_blank",
      "noopener,noreferrer"
    );
    void copy.catch(() => undefined);

    return "instagram";
  }

  function triggerGuest(
    name: string,
    instagram: string,
    phone: string,
    target: Audience
  ) {
    const message = inviteMessage(target, name, link);
    const channel = openConversation(phone, instagram, message);

    if (channel === "none") {
      showNotice("Informe um WhatsApp válido ou um @ do Instagram.");
      return;
    }

    if (channel === "instagram") {
      showNotice("Sem WhatsApp válido: mensagem copiada para o Instagram.");
    }
  }

  function addGuest() {
    if (!guestName.trim() && !guestInstagram.trim() && !guestPhone.trim()) {
      showNotice("Informe nome, Instagram ou WhatsApp do convidado.");
      return;
    }

    const guest: Guest = {
      id: createGuestId(),
      name: guestName.trim(),
      instagram: guestInstagram.trim(),
      phone: guestPhone.trim(),
      audience,
      sent: false,
    };

    persist([guest, ...guests]);
    setGuestName("");
    setGuestInstagram("");
    setGuestPhone("");
    showNotice("Convidado adicionado à lista.");
  }

  function toggleSent(id: string) {
    persist(
      guests.map((guest) =>
        guest.id === id ? { ...guest, sent: !guest.sent } : guest
      )
    );
  }

  function removeGuest(id: string) {
    persist(guests.filter((guest) => guest.id !== id));
  }

  function downloadQr() {
    if (qrStatus !== "ready" || !qrSrc) return;

    const anchor = document.createElement("a");
    anchor.href = qrSrc;
    anchor.download = `qrcode-${audience}.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  const inviteText = inviteMessage(audience, "", link);
  const storyText =
    audience === "influencer"
      ? `Criador de conteúdo? A Feijoada dos Influenciadores está com inscrições abertas para a 4ª edição. Garanta sua vaga: ${link}`
      : `Sua marca no centro da Feijoada dos Influenciadores. Conheça as cotas de patrocínio da 4ª edição: ${link}`;

  return (
    <div className="min-h-dvh bg-[#f7f8f8] pb-16">
      <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              LeadEvent
            </p>
            <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">
              Central de Divulgação
            </h1>
          </div>
          <a
            href="/dashboard"
            className="shrink-0 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-black/[0.03]"
          >
            Painel
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-5">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-black/10 bg-white p-1.5">
          {AUDIENCES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setAudience(item.id)}
              className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                audience === item.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-black/[0.04] hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <SectionCard
          title="Link com UTM"
          description="O link muda conforme o público e os parâmetros abaixo."
        >
          <div className="space-y-3">
            <Field label="Site">
              <input
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
                className={inputClass}
                placeholder="https://seu-site.com"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="utm_source">
                <input
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  className={inputClass}
                  placeholder="instagram"
                />
              </Field>
              <Field label="utm_medium">
                <input
                  value={medium}
                  onChange={(event) => setMedium(event.target.value)}
                  className={inputClass}
                  placeholder="story"
                />
              </Field>
              <Field label="utm_campaign">
                <input
                  value={campaign}
                  onChange={(event) => setCampaign(event.target.value)}
                  className={inputClass}
                  placeholder="feijoada-4"
                />
              </Field>
            </div>

            <div className="rounded-xl border border-black/10 bg-black/[0.02] p-3">
              <p className="break-all text-xs leading-relaxed text-muted-foreground">
                {link}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void copyText("link", link)}
                className="rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-background transition-opacity hover:opacity-90"
              >
                {copiedKey === "link" ? "Copiado!" : "Copiar link"}
              </button>
              <button
                type="button"
                onClick={() => void shareText("share-link", "LeadEvent", inviteText)}
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-black/[0.03]"
              >
                Compartilhar
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="QR Code"
          description="Gerado pela API pública qrserver e baixado como PNG."
        >
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-white">
              {qrSrc ? (
                <img
                  src={qrSrc}
                  alt={`QR Code para ${audience}`}
                  width={192}
                  height={192}
                  className="size-48 object-contain"
                />
              ) : (
                <span className="px-4 text-center text-xs text-muted-foreground">
                  Gerando QR Code...
                </span>
              )}
            </div>

            <div className="w-full space-y-2">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {qrStatus === "loading" && "Gerando imagem..."}
                {qrStatus === "ready" && "Pronto para imprimir ou colar no story."}
                {qrStatus === "error" &&
                  "Não foi possível baixar a imagem. O QR continua visível acima."}
              </p>
              <button
                type="button"
                onClick={downloadQr}
                disabled={qrStatus !== "ready"}
                className="w-full rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                Baixar QR Code
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Disparo rápido"
          description="Abre o WhatsApp se houver número válido. Sem número, abre o Instagram e copia a mensagem."
        >
          <div className="space-y-3">
            <Field label="Nome">
              <input
                value={guestName}
                onChange={(event) => setGuestName(event.target.value)}
                className={inputClass}
                placeholder="Nome do convidado"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Instagram">
                <input
                  value={guestInstagram}
                  onChange={(event) => setGuestInstagram(event.target.value)}
                  className={inputClass}
                  placeholder="@perfil ou link"
                />
              </Field>
              <Field label="WhatsApp">
                <input
                  value={guestPhone}
                  onChange={(event) => setGuestPhone(event.target.value)}
                  className={inputClass}
                  placeholder="(00) 00000-0000"
                  inputMode="tel"
                />
              </Field>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  triggerGuest(guestName, guestInstagram, guestPhone, audience)
                }
                className="rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-background transition-opacity hover:opacity-90"
              >
                Abrir conversa
              </button>
              <button
                type="button"
                onClick={addGuest}
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-black/[0.03]"
              >
                Salvar na lista
              </button>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title={`Lista de convidados (${guests.length})`}
          description="Salva neste navegador. Marque quem já recebeu o convite."
        >
          {guests.length === 0 ? (
            <p className="rounded-xl border border-dashed border-black/10 px-4 py-6 text-center text-xs text-muted-foreground">
              Nenhum convidado salvo ainda.
            </p>
          ) : (
            <ul className="space-y-2">
              {guests.map((guest) => (
                <li
                  key={guest.id}
                  className="rounded-xl border border-black/10 p-3"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={guest.sent}
                      onChange={() => toggleSent(guest.id)}
                      aria-label={`Marcar ${guest.name || "convidado"} como enviado`}
                      className="mt-1 size-4 shrink-0 accent-foreground"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {guest.name || "Sem nome"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {guest.audience === "influencer"
                          ? "Influenciador"
                          : "Empresa"}
                        {guest.instagram ? ` · ${guest.instagram}` : ""}
                        {guest.phone ? ` · ${guest.phone}` : ""}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          triggerGuest(
                            guest.name,
                            guest.instagram,
                            guest.phone,
                            guest.audience
                          )
                        }
                        className="rounded-lg border border-black/10 bg-white px-2 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-black/[0.03]"
                      >
                        Enviar
                      </button>
                      <button
                        type="button"
                        onClick={() => removeGuest(guest.id)}
                        className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600 transition-colors hover:bg-red-100"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Textos prontos">
          <div className="space-y-3">
            <div className="rounded-xl border border-black/10 bg-black/[0.02] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Convite
              </p>
              <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-foreground/80">
                {inviteText}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void copyText("invite", inviteText)}
                  className="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-black/[0.03]"
                >
                  {copiedKey === "invite" ? "Copiado!" : "Copiar convite"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void shareText("share-invite", "Convite LeadEvent", inviteText)
                  }
                  className="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-black/[0.03]"
                >
                  Compartilhar
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-black/10 bg-black/[0.02] p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Story
              </p>
              <p className="mt-2 whitespace-pre-line text-xs leading-relaxed text-foreground/80">
                {storyText}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void copyText("story", storyText)}
                  className="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-black/[0.03]"
                >
                  {copiedKey === "story" ? "Copiado!" : "Copiar story"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void shareText("share-story", "Story LeadEvent", storyText)
                  }
                  className="rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-black/[0.03]"
                >
                  Compartilhar
                </button>
              </div>
            </div>
          </div>
        </SectionCard>
      </main>

      {notice && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl border border-black/10 bg-foreground px-4 py-3 text-center text-xs font-medium text-background shadow-lg"
        >
          {notice}
        </div>
      )}
    </div>
  );
}
