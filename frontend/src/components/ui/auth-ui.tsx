"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, type FormEvent } from "react";
import { ArrowRight, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Typewriter } from "@/components/ui/typewriter";
import { cn } from "@/lib/utils";
import { brand } from "@/lib/brand";

export interface SignInValues {
  username: string;
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
  error?: string | null;
  loading?: boolean;
  onSignIn?: (values: SignInValues) => void | Promise<void>;
}

const defaultAuthContent: Required<AuthContent> = {
  image: {
    src: "/media/leadevent-hero.jpg",
    alt: brand.event.name,
  },
  quote: {
    text: [
      "Protegendo seus ativos digitais.",
      "Conectando marcas e criadores.",
      "Segurança em cada detalhe.",
    ],
    author: `${brand.company.shortName} — ${brand.company.name}`,
  },
};

function resolveContent(content?: AuthContent) {
  return {
    image: { ...defaultAuthContent.image, ...content?.image },
    quote: { ...defaultAuthContent.quote, ...content?.quote },
  };
}

function Brand({ className }: { className?: string }) {
  return (
    <Image
      src={brand.event.logo}
      width={200}
      height={123}
      alt={brand.event.name}
      loading="eager"
      className={cn("h-14 w-auto object-contain", className)}
    />
  );
}

function SignInForm({
  onSubmit,
  error,
  loading = false,
}: {
  onSubmit?: (values: SignInValues) => void | Promise<void>;
  error?: string | null;
  loading?: boolean;
}) {
  const usernameId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    void onSubmit?.({
      username: String(data.get("username") ?? "").trim(),
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
          <Label htmlFor={usernameId}>Username</Label>
          <div className="relative">
            <User
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60"
            />
            <Input
              id={usernameId}
              name="username"
              type="text"
              placeholder="username"
              autoComplete="username"
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

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-xl bg-brand text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/20 transition-colors hover:bg-brand/90"
        >
          {loading ? (
            <>
              Entrando...
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            </>
          ) : (
            <>
              Entrar
              <ArrowRight aria-hidden="true" className="size-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export function AuthUI({
  signInContent,
  error,
  loading,
  onSignIn,
}: AuthUIProps) {
  const content = resolveContent(signInContent);

  return (
    <main className="grid min-h-[100dvh] w-full bg-white lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#061a2b] lg:flex lg:flex-col lg:justify-end lg:p-12 xl:p-16">
        <Image
          src={content.image.src}
          alt={content.image.alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-[50%_30%]"
        />
        <div className="absolute inset-0 bg-[#04131f]/20" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#04131f] via-[#04131f]/75 to-transparent" />

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
          >
            <Brand />
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
                error={error}
                loading={loading}
              />
            </div>
          </div>
        </div>

        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground/60 lg:justify-start">
          <span>
            © {brand.company.shortName} · {brand.company.name}
          </span>
          <Link
            href="/privacidade"
            className="transition-colors hover:text-foreground"
          >
            Privacidade
          </Link>
        </p>
      </section>
    </main>
  );
}
