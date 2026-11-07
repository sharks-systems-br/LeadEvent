"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowUpRight,
  Building2,
  ChevronDown,
  LifeBuoy,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TransitionLink } from "@/components/ui/page-transition";

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
  roles?: RoleOption[];
  onSelectRole?: (role: Role) => void;
  supportHref?: string;
}

const Brand = () => (
  <div className="flex items-center gap-3">
    <Image
      src="/brand/feijoada-logo.png"
      width={200}
      height={123}
      alt="Feijoada dos Influenciadores"
      loading="eager"
      className="h-14 w-auto object-contain md:h-16"
    />
    <span className="h-8 w-px bg-black/10" aria-hidden="true" />
    <span className="text-sm font-semibold tracking-tight text-foreground">
      LeadEvent
    </span>
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
        <TransitionLink
          href={role.href}
          onNavigate={() => onSelect?.(role.id)}
          className="flex h-12 flex-1 items-center justify-between gap-2 rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-foreground transition-colors duration-300 hover:bg-neutral-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
        >
          <span>{role.title}</span>
          <ArrowUpRight className="size-4 shrink-0" />
        </TransitionLink>

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
      perfil?
    </span>
  ),
  description = "Escolha a opção que mais combina com o seu perfil. Empresas para que possam patrocinar o evento, influenciadores interessados em participar.",
  roles = defaultRoles,
  onSelectRole,
  supportHref = "mailto:contato@leadevent.com",
}) => {
  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-background font-sans lg:h-[100dvh] lg:flex-row">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden lg:w-1/2"
      >
        <div className="bg-grid absolute inset-0" />
        <div className="absolute -left-32 top-1/4 size-96 rounded-full bg-violet-500/15 blur-[120px]" />
        <div className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-fuchsia-500/10 blur-[100px]" />
      </div>

      <section className="relative z-10 order-2 flex flex-1 flex-col px-6 py-8 md:px-12 lg:order-1 lg:overflow-y-auto lg:px-16">
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
          <span>
            Desenvolvido por SSB · Sharks Systems Brazil
          </span>
          <a
            href="#"
            className="transition-colors hover:text-muted-foreground"
          >
            Privacidade
          </a>
        </footer>
      </section>

      <section className="relative order-1 flex shrink-0 items-center justify-center px-6 pt-4 md:px-12 lg:order-2 lg:shrink lg:flex-1 lg:p-4">
        <Image
          src="/media/leadevent-hero.jpg"
          alt="Feijoada dos Influenciadores — 4ª edição"
          width={1080}
          height={1440}
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="animate-hero animate-delay-300 h-auto w-full rounded-3xl border border-white/10 object-contain lg:h-auto lg:w-auto lg:max-h-full lg:max-w-full"
        />
      </section>
    </div>
  );
};
