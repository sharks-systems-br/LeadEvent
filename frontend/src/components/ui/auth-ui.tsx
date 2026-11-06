"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { ArrowRight, Mail, User } from "lucide-react";
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

export interface SignUpValues {
  name: string;
  email: string;
  password: string;
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
  signUpContent?: AuthContent;
  onSignIn?: (values: SignInValues) => void;
  onSignUp?: (values: SignUpValues) => void;
  onGoogle?: () => void;
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

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
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

function SignUpForm({
  onSubmit,
}: {
  onSubmit?: (values: SignUpValues) => void;
}) {
  const nameId = useId();
  const emailId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    onSubmit?.({
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
    });
  }

  return (
    <form onSubmit={handleSubmit} autoComplete="on">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#061a2b] sm:text-[2.15rem]">
          Crie sua conta
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Preencha seus dados para começar.
        </p>
      </div>

      <div className="mt-8 grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor={nameId}>Nome completo</Label>
          <div className="relative">
            <User
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60"
            />
            <Input
              id={nameId}
              name="name"
              placeholder="Seu nome"
              autoComplete="name"
              className="pl-10"
              required
            />
          </div>
        </div>

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
          placeholder="Crie uma senha"
          autoComplete="new-password"
          minLength={8}
          required
        />

        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-brand text-sm font-semibold text-brand-foreground shadow-lg shadow-brand/20 transition-colors hover:bg-brand/90"
        >
          Criar conta
          <ArrowRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </form>
  );
}

function AuthFormContainer({
  isSignIn,
  onToggle,
  onSignIn,
  onSignUp,
  onGoogle,
  onForgotPassword,
}: {
  isSignIn: boolean;
  onToggle: () => void;
  onSignIn?: (values: SignInValues) => void;
  onSignUp?: (values: SignUpValues) => void;
  onGoogle?: () => void;
  onForgotPassword?: () => void;
}) {
  return (
    <div className="w-full">
      {isSignIn ? (
        <SignInForm onSubmit={onSignIn} onForgotPassword={onForgotPassword} />
      ) : (
        <SignUpForm onSubmit={onSignUp} />
      )}

      <div className="mt-7">
        <div className="relative text-center text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-black/10">
          <span className="relative z-10 bg-white px-3">ou continue com</span>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onGoogle}
          className="mt-4 h-12 w-full rounded-xl border-black/10 bg-white text-sm font-medium text-[#061a2b] hover:bg-neutral-50"
        >
          <GoogleIcon />
          Continuar com Google
        </Button>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        {isSignIn ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
        <button
          type="button"
          onClick={onToggle}
          className="font-semibold text-brand transition-colors hover:text-brand/80 hover:underline"
        >
          {isSignIn ? "Cadastre-se" : "Entrar"}
        </button>
      </p>
    </div>
  );
}

export function AuthUI({
  signInContent,
  signUpContent,
  onSignIn,
  onSignUp,
  onGoogle,
  onForgotPassword,
}: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(true);

  const content = resolveContent(isSignIn ? signInContent : signUpContent);

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
            <div key={isSignIn ? "sign-in" : "sign-up"} className="animate-element">
              <AuthFormContainer
                isSignIn={isSignIn}
                onToggle={() => setIsSignIn((value) => !value)}
                onSignIn={onSignIn}
                onSignUp={onSignUp}
                onGoogle={onGoogle}
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
