"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, type FormEvent } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Typewriter } from "@/components/ui/typewriter";
import { cn } from "@/lib/utils";

export interface SignInValues {
  email: string;
  password: string;
  remember: boolean;
}

export interface AuthContent {
  image?: {
    src: string;
    alt: string;
  };
  quote?: {
    text: string | string[];
    author: string;
  };
}

export interface AuthUIProps {
  signInContent?: AuthContent;
  onSignIn?: (values: SignInValues) => void;
  onForgotPassword?: () => void;
}

const defaultAuthContent: Required<AuthContent> = {
  image: {
    src: "/brand/auth-panel.jpg",
    alt: "SSB — Sharks Systems Brazil",
  },
  quote: {
    text: [
      "Protegendo seus ativos digitais.",
      "Conectando marcas e criadores.",
      "Segurança em cada detalhe.",
    ],
    author: "SSB — Sharks Systems Brazil",
  },
};

function resolveContent(content?: AuthContent) {
  return {
    image: { ...defaultAuthContent.image, ...content?.image },
    quote: { ...defaultAuthContent.quote, ...content?.quote },
  };
}

function Brand({
  variant = "light",
  size = "lg",
  className,
}: {
  variant?: "light" | "dark";
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <div className={className}>
      <p
        className={cn(
          "font-black leading-none tracking-[-0.08em]",
          size === "lg" ? "text-4xl sm:text-5xl" : "text-2xl",
          variant === "light" ? "text-white" : "text-[#061a2b]"
        )}
      >
        SSB
      </p>
      <p
        className={cn(
          "mt-1.5 font-semibold uppercase tracking-[0.3em] text-brand",
          size === "lg" ? "text-[9px] sm:text-[10px]" : "text-[8px]"
        )}
      >
        Sharks Systems Brazil
      </p>
    </div>
  );
}

function SignInForm({
  onSubmit,
  onForgotPassword,
}: {
  onSubmit?: (values: SignInValues) => void;
  onForgotPassword?: () => void;
}) {
  const emailId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    onSubmit?.({
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      remember: data.get("remember") === "on",
    });
  }

  return (
    <form onSubmit={handleSubmit} autoComplete="on">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#061a2b] sm:text-[2.15rem]">
          Bem-vindo ao LeadEvent
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Entre com seus dados para acessar a plataforma.
        </p>
      </div>

      <div className="mt-8 grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor={emailId}>E-mail</Label>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60"
            />
            <Input
              id={emailId}
              name="email"
              type="email"
              placeholder="voce@empresa.com"
              autoComplete="email"
              className="pl-10"
              required
            />
          </div>
        </div>

        <PasswordInput
          name="password"
          label="Senha"
          placeholder="Digite sua senha"
          autoComplete="current-password"
          required
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              name="remember"
              className="size-4 rounded border-black/20 accent-brand"
            />
            Lembrar por 30 dias
          </label>

          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm font-medium text-brand transition-colors hover:text-brand/80 hover:underline"
          >
            Esqueceu a senha?
          </button>
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-brand text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/20 transition-colors hover:bg-brand/90"
        >
          Entrar
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </form>
  );
}

export function AuthUI({
  signInContent,
  onSignIn,
  onForgotPassword,
}: AuthUIProps) {
  const content = resolveContent(signInContent);

  return (
    <main className="grid min-h-[100dvh] w-full bg-white lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#061a2b] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <Image
          src={content.image.src}
          alt={content.image.alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-[38%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#04131f]/90 via-[#061a2b]/30 to-[#04131f]/85" />

        <div className="relative z-10">
          <Link
            href="/"
            aria-label="Voltar para a seleção de perfil"
            className="inline-block"
          >
            <Brand />
          </Link>
          <p className="mt-8 max-w-[17rem] text-lg font-light leading-snug text-white/70">
            Protegendo seus ativos digitais.
          </p>
        </div>

        <div className="relative z-10 max-w-sm">
          <blockquote className="space-y-3">
            <p className="min-h-[3.75rem] text-lg font-light leading-relaxed text-white/80">
              “
              <Typewriter
                key={`${content.quote.text}`}
                text={content.quote.text}
                speed={55}
                loop
                delay={2200}
              />
              ”
            </p>
            <cite className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35 not-italic">
              {content.quote.author}
            </cite>
          </blockquote>
        </div>
      </section>

      <section className="flex min-h-[100dvh] flex-col px-6 py-8 sm:px-10 lg:px-14 lg:py-10 xl:px-20">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            aria-label="Voltar para a seleção de perfil"
            className="lg:hidden"
          >
            <Brand variant="dark" size="sm" />
          </Link>
          <a
            href="mailto:contato@leadevent.com"
            className="ml-auto text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Precisa de ajuda?
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
          <div className="w-full max-w-[430px]">
            <div className="animate-element">
              <SignInForm
                onSubmit={onSignIn}
                onForgotPassword={onForgotPassword}
              />
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/60 lg:text-left">
          © SSB · Sharks Systems Brazil
        </p>
      </section>
    </main>
  );
}
