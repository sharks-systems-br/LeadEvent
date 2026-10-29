import { TransitionLink } from "@/components/ui/page-transition";
import { ArrowLeft, ArrowUpRight, Building2, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleComingSoonProps {
  role: "empresa" | "influencer";
}

export function RoleComingSoon({ role }: RoleComingSoonProps) {
  const isCompany = role === "empresa";
  const Icon = isCompany ? Building2 : Sparkles;
  const title = isCompany ? "Cadastro de empresa" : "Cadastro de influencer";
  const otherRole = isCompany
    ? { label: "Sou influencer", href: "/influencer" }
    : { label: "Sou empresa", href: "/empresa" };

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background px-6 py-12 font-sans">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="bg-grid absolute inset-0" />
        <div className="absolute left-1/2 top-1/2 size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/15 blur-[130px]" />
      </div>

      <div className="animate-element relative w-full max-w-md rounded-3xl border border-black/10 bg-white/70 p-8 text-center shadow-xl shadow-black/5 backdrop-blur-xl">
        <TransitionLink
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </TransitionLink>

        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-600/30">
          <Icon className="size-6 text-white" />
        </span>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Esta etapa está sendo preparada. Em breve você poderá preencher seus
          dados e fazer parte do próximo LeadEvent.
        </p>

        <TransitionLink
          href={otherRole.href}
          className={cn(
            "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          )}
        >
          {otherRole.label}
          <ArrowUpRight className="size-4" />
        </TransitionLink>

        <p className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
          <Zap className="size-3.5" />
          LeadEvent
        </p>
      </div>
    </main>
  );
}
