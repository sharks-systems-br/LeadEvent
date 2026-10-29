"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Building2,
  ChevronDown,
  LifeBuoy,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

export type Role = "company" | "influencer";

export interface RoleOption {
  id: Role;
  label?: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  videoSrc?: string;
  videoPosterSrc?: string;
  testimonials?: Testimonial[];
  roles?: RoleOption[];
  onSelectRole?: (role: Role) => void;
  supportHref?: string;
}

// --- SUB-COMPONENTS ---

const Brand = () => (
  <div className="flex items-center gap-3">
    {/* <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-600/30">
      <Zap className="size-5 text-white" strokeWidth={2.5} />
    </span>
    <span className="text-lg font-semibold tracking-tight text-foreground">
      LeadEvent
    </span> */}
  </div>
);

const TestimonialCard = ({
  testimonial,
  delay,
}: {
  testimonial: Testimonial;
  delay: string;
}) => (
  <div
    className={cn(
      "animate-testimonial flex w-60 items-start gap-3 rounded-3xl border border-white/10 bg-black/35 p-4 backdrop-blur-xl",
      delay
    )}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={testimonial.avatarSrc}
      className="h-9 w-9 shrink-0 rounded-2xl object-cover"
      alt={testimonial.name}
      loading="lazy"
    />
    <div className="text-sm leading-snug">
      <p className="font-medium text-white">{testimonial.name}</p>
      <p className="text-xs text-white/50">{testimonial.handle}</p>
      <p className="mt-1 text-[13px] text-white/75">{testimonial.text}</p>
    </div>
  </div>
);

const RoleCard = ({
  role,
  delay,
  onSelect,
}: {
  role: RoleOption;
  delay: string;
  onSelect?: (role: Role) => void;
}) => {
  const isCompany = role.id === "company";
  const Icon = isCompany ? Building2 : Sparkles;
  const [open, setOpen] = useState(false);
  const label = role.label ?? (isCompany ? "Empresa" : "Influencer");
  const detailsId = `role-${role.id}-details`;

  return (
    <div className={cn("role-option animate-element relative", delay)}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span
          className={cn(
            "relative flex size-10 shrink-0 items-center justify-center rounded-2xl transition-colors duration-300",
            "text-foreground"
          )}
        >
          <Icon className="size-7" />
        </span>

        <span className="text-lg font-medium text-foreground">{label}</span>

        {role.badge && (
          <span className="hidden rounded-full border border-black/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-700 xl:inline-flex">
            {role.badge}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-stretch gap-2">
        <a
          href={role.href}
          onClick={() => onSelect?.(role.id)}
          className="flex h-12 flex-1 items-center justify-between gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-neutral-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
        >
          <span>{role.title}</span>
          <ArrowUpRight className="size-4 shrink-0" />
        </a>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={detailsId}
          aria-label={`Saber mais sobre ${label}`}
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-white text-foreground transition-colors hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 [@media(hover:hover)]:hidden"
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-300",
              open && "rotate-180"
            )}
          />
        </button>
      </div>

      <div id={detailsId} className={cn("role-details", open && "is-open")}>
        <div className="overflow-hidden">
          <p className="pt-3 text-sm leading-relaxed text-muted-foreground">
            {role.description}
          </p>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

const defaultRoles: RoleOption[] = [
  {
    id: "company",
    label: "Empresa",
    title: "Sou Empresa",
    description:
      "Sua empresa será patrocinadora do evento e a marca será divulgada para todo o público.",
    href: "/empresa",
    badge: "Patrocinador",
  },
  {
    id: "influencer",
    label: "Influencer",
    title: "Sou Influencer",
    description:
      "Você participa de uma seleção entre outros criadores para conquistar uma vaga no evento.",
    href: "/influencer",
    badge: "Criador",
  },
];

export const SignInPage: React.FC<SignInPageProps> = ({
  title = (
    <span className="font-light tracking-tighter text-foreground">
      Qual é o seu{" "}
      {/* <span className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-500 bg-clip-text font-semibold text-transparent"> */}
        perfil?
      {/* </span> */}
    </span>
  ),
  description = "Escolha a opção que mais combina com o seu perfil. Empresas para que possam patrocinar o evento, influenciadores interessados em participar.",
  videoSrc = "/media/leadevent-hero.mp4",
  videoPosterSrc = "/media/leadevent-hero-poster.jpg",
  testimonials = [],
  roles = defaultRoles,
  onSelectRole,
  supportHref = "mailto:contato@leadevent.com",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const playVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    void video.play().catch(() => {
      // Autoplay can be blocked by the browser. The poster stays visible
      // and playback is retried the next time the tab becomes visible.
    });
  }, []);

  useEffect(() => {
    playVideo();

    const onVisibilityChange = () => {
      if (!document.hidden) playVideo();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", playVideo);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", playVideo);
    };
  }, [playVideo]);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-background font-sans lg:h-[100dvh] lg:flex-row">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden lg:w-1/2"
      >
        <div className="bg-grid absolute inset-0" />
        <div className="absolute -left-32 top-1/4 size-96 rounded-full bg-violet-500/15 blur-[120px]" />
        <div className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-fuchsia-500/10 blur-[100px]" />
      </div>

      {/* Left column: role selection */}
      <section className="relative z-10 flex flex-1 flex-col px-6 py-8 md:px-12 lg:overflow-y-auto lg:px-16">
        <header className="animate-element animate-delay-100">
          <Brand />
        </header>

        <div className="flex flex-1 items-center py-10 md:py-8">
          <div className="w-full max-w-md md:max-w-lg">
            <h1 className="animate-element animate-delay-200 text-4xl font-semibold leading-[1.05] md:text-5xl">
              {title}
            </h1>

            <p className="animate-element animate-delay-300 mt-4 max-w-md text-muted-foreground">
              {description}
            </p>

            <div className="mt-8 grid gap-x-4 gap-y-6 sm:grid-cols-2">
              {roles.map((role, index) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  delay={`animate-delay-${index === 0 ? "400" : "500"}`}
                  onSelect={onSelectRole}
                />
              ))}
            </div>

            <p className="animate-element animate-delay-600 mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <LifeBuoy className="size-4 shrink-0" />
              Precisa de ajuda?{" "}
              <a
                href={supportHref}
                className="text-violet-600 transition-colors hover:text-violet-500 hover:underline"
              >
                Fale com o nosso time
              </a>
            </p>
          </div>
        </div>

        <footer className="animate-element animate-delay-700 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground/70">
          {/* <span>© 2026 LeadEvent. Todos os direitos reservados.</span> */}
          <a
            href="#"
            className="transition-colors hover:text-muted-foreground"
          >
            Privacidade
          </a>
        </footer>
      </section>

      {/* Right column: autoplaying video + testimonials */}
      <section className="relative hidden flex-1 p-4 lg:block">
        <div className="animate-slide-right animate-delay-300 relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-black">
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={videoSrc}
            poster={videoPosterSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={playVideo}
            aria-hidden="true"
            tabIndex={-1}
          />

          {/* Readability overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-black/40" />
          <div className="absolute inset-0 bg-violet-950/10" />
          <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />

          {/* Bottom testimonials */}
          {testimonials.length > 0 && (
            <div className="absolute inset-x-0 bottom-0">
              <p className="animate-element animate-delay-900 mb-4 px-8 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                Quem já está dentro
              </p>
              <div className="flex w-full justify-center gap-4 px-8 pb-8">
                <TestimonialCard
                  testimonial={testimonials[0]}
                  delay="animate-delay-1000"
                />
                {testimonials[1] && (
                  <div className="hidden xl:flex">
                    <TestimonialCard
                      testimonial={testimonials[1]}
                      delay="animate-delay-1200"
                    />
                  </div>
                )}
                {testimonials[2] && (
                  <div className="hidden 2xl:flex">
                    <TestimonialCard
                      testimonial={testimonials[2]}
                      delay="animate-delay-1400"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
