import * as React from "react";
import { ArrowLeft, Check, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { TransitionLink } from "@/components/ui/page-transition";
import { cn } from "@/lib/utils";

interface FormPageShellProps {
  badge: string;
  shortBadge?: string;
  children: React.ReactNode;
}

export function FormPageShell({
  badge,
  shortBadge,
  children,
}: FormPageShellProps) {
  return (
    <div className="relative min-h-[100dvh] overflow-x-clip bg-background font-sans">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="bg-grid absolute inset-0 opacity-70" />
        <div className="absolute -left-40 -top-24 size-[34rem] rounded-full bg-violet-500/[0.09] blur-[130px]" />
        <div className="absolute -bottom-32 -right-32 size-[30rem] rounded-full bg-fuchsia-500/[0.07] blur-[120px]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-6">
        <TransitionLink
          href="/"
          className="group inline-flex items-center gap-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="flex size-9 items-center justify-center rounded-full border border-black/10 bg-white/80 shadow-sm backdrop-blur transition-transform duration-200 group-hover:-translate-x-0.5">
            <ArrowLeft className="size-4" />
          </span>
          Voltar
        </TransitionLink>

        <span className="whitespace-nowrap rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur sm:text-[11px]">
          <span className="sm:hidden">{shortBadge ?? badge}</span>
          <span className="hidden sm:inline">{badge}</span>
        </span>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-3 sm:px-8 sm:pt-6">
        {children}
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] px-5 py-6 text-[11px] text-muted-foreground/70 sm:px-8">
        <span className="inline-flex items-center gap-1.5">
          <Zap className="size-3.5" />
          LeadEvent · conexões que viram experiência
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" />
          Seus dados ficam protegidos
        </span>
        <span className="w-full text-[10px] text-muted-foreground/50">
          Desenvolvido por SSB · Sharks Systems Brazil
        </span>
      </footer>
    </div>
  );
}

interface FormIntroProps {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  meta?: string;
  className?: string;
}

export function FormIntro({
  eyebrow,
  title,
  description,
  meta,
  className,
}: FormIntroProps) {
  return (
    <div className={cn("min-w-0 max-w-xl", className)}>
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <Sparkles className="size-3.5" />
        {eyebrow}
      </p>
      <h1 className="mt-4 text-[2.15rem] font-semibold leading-[1.06] tracking-tight text-foreground sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description}
      </p>
      {meta && (
        <p className="mt-3 text-xs font-medium text-muted-foreground/80">
          {meta}
        </p>
      )}
    </div>
  );
}

export function FormCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-[1.75rem] border border-black/10 bg-white/75 p-5 shadow-xl shadow-black/[0.04] backdrop-blur-xl sm:p-7 lg:p-8",
        className
      )}
    >
      {children}
    </div>
  );
}

interface FormSuccessProps {
  title: string;
  description: string;
  onReset: () => void;
  resetLabel?: string;
  children?: React.ReactNode;
}

export function FormSuccess({
  title,
  description,
  onReset,
  resetLabel = "Enviar outro cadastro",
  children,
}: FormSuccessProps) {
  return (
    <div className="animate-element mx-auto w-full max-w-xl rounded-[2rem] border border-black/10 bg-white/80 p-7 text-center shadow-2xl shadow-black/[0.06] backdrop-blur-xl sm:p-10">
      <span className="relative mx-auto flex size-16 items-center justify-center rounded-full border border-black/10 bg-foreground text-background shadow-lg shadow-black/15">
        <span
          aria-hidden="true"
          className="animate-soft-pulse absolute inset-0 rounded-full bg-emerald-500/20"
        />
        <Check className="relative size-7" strokeWidth={2.5} />
      </span>

      <h2 className="mt-6 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {children}

      <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-5 text-sm font-medium text-foreground transition-colors hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25 focus-visible:ring-offset-2"
        >
          {resetLabel}
        </button>
        <TransitionLink
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2"
        >
          Voltar ao início
        </TransitionLink>
      </div>
    </div>
  );
}
