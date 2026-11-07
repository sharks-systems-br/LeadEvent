"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Clock,
  Handshake,
  Mail,
  Send,
  Sparkles,
} from "lucide-react";
import {
  ChoiceCards,
  ConsentCheckbox,
  Field,
  FormSection,
  SubmitButton,
  TextInput,
  Textarea,
  type ChoiceOption,
} from "@/components/forms/form-controls";
import {
  FormCard,
  FormIntro,
  FormPageShell,
  FormSuccess,
} from "@/components/forms/form-shell";
import { Turnstile, TURNSTILE_ENABLED } from "@/components/forms/turnstile";
import {
  formatCNPJ,
  isValidCNPJ,
  isValidCompanyName,
  isValidEmail,
  isValidFullName,
  validateCompanySocial,
} from "@/lib/form-validation";
import { getApiErrorMessage } from "@/lib/api/errors";
import { submitCompany } from "@/lib/api/submissions";
import { brand } from "@/lib/brand";
import { useFormDraft } from "@/lib/use-form-draft";

const PARTNERSHIP_OPTIONS: ChoiceOption[] = [
  {
    value: "cota",
    label: "Cota de patrocínio",
    description: "Marca nas peças, no palco e na comunicação do evento.",
  },
  {
    value: "ativacao",
    label: "Ativação de marca",
    description: "Ação ou experiência com o público durante o evento.",
  },
  {
    value: "conteudo",
    label: "Conteúdo com influenciadores",
    description: "Criação de conteúdo com os criadores selecionados.",
  },
  {
    value: "estande",
    label: "Estande ou experiência",
    description: "Espaço físico para receber e engajar o público.",
  },
  {
    value: "naming",
    label: "Naming rights",
    description: "Associação do nome da sua marca ao evento.",
  },
  {
    value: "outro",
    label: "Outro formato",
    description: "Conte abaixo o formato que você tem em mente.",
  },
];

const AVAILABILITY_OPTIONS: ChoiceOption[] = [
  { value: "manha", label: "Manhã", description: "Entre 9h e 12h" },
  { value: "tarde", label: "Tarde", description: "Entre 13h e 18h" },
  { value: "fim-do-dia", label: "Fim do dia", description: "Entre 18h e 20h" },
  { value: "qualquer", label: "Qualquer horário", description: "Flexível" },
  {
    value: "email",
    label: "Prefiro agendar por e-mail",
    description: "Enviamos algumas opções",
  },
];

interface CompanyValues {
  companyName: string;
  cnpj: string;
  email: string;
  responsible: string;
  social: string;
  description: string;
  formats: string[];
  customFormat: string;
  availability: string;
  consent: boolean;
}

type FieldKey = keyof CompanyValues | "turnstile";
type Errors = Partial<Record<FieldKey, string>>;

const INITIAL_VALUES: CompanyValues = {
  companyName: "",
  cnpj: "",
  email: "",
  responsible: "",
  social: "",
  description: "",
  formats: [],
  customFormat: "",
  availability: "",
  consent: false,
};

const DRAFT_KEY = "leadevent:company-draft";
const DRAFT_OMIT: readonly (keyof CompanyValues)[] = ["consent"];

const FIELD_IDS: Record<FieldKey, string> = {
  companyName: "company-name",
  cnpj: "company-cnpj",
  email: "company-email",
  responsible: "company-responsible",
  social: "company-social",
  description: "company-description",
  formats: "company-formats",
  customFormat: "company-custom-format",
  availability: "company-availability",
  turnstile: "company-turnstile",
  consent: "company-consent",
};

function validate(
  values: CompanyValues,
  turnstileToken: string | null
): Errors {
  const errors: Errors = {};

  if (!values.companyName.trim()) {
    errors.companyName = "Informe o nome fantasia da empresa.";
  } else if (!isValidCompanyName(values.companyName)) {
    errors.companyName = "Use um nome com pelo menos 2 caracteres.";
  }

  if (!values.cnpj.trim()) {
    errors.cnpj = "Informe o CNPJ da empresa.";
  } else if (!isValidCNPJ(values.cnpj)) {
    errors.cnpj = "Informe um CNPJ válido.";
  }

  if (!values.email.trim()) {
    errors.email = "Informe o e-mail de contato.";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!values.responsible.trim()) {
    errors.responsible = "Informe o nome do responsável.";
  } else if (!isValidFullName(values.responsible)) {
    errors.responsible = "Use nome e sobrenome, apenas com letras.";
  }

  const socialError = validateCompanySocial(values.social);
  if (socialError) errors.social = socialError;

  if (!values.description.trim()) {
    errors.description = "Conte o motivo do patrocínio.";
  } else if (values.description.trim().length < 30) {
    errors.description = "Escreva pelo menos 30 caracteres.";
  }

  if (values.formats.length === 0) {
    errors.formats = "Selecione pelo menos um formato de parceria.";
  } else if (values.formats.includes("outro")) {
    const customFormat = values.customFormat.trim();

    if (!customFormat) {
      errors.customFormat = "Descreva o formato desejado.";
    } else if (customFormat.length > 30) {
      errors.customFormat = "Use no máximo 30 caracteres.";
    }
  }

  if (!values.availability) {
    errors.availability = "Selecione a sua disponibilidade.";
  }

  if (!values.consent) {
    errors.consent = "É necessário autorizar o contato para continuar.";
  }

  if (TURNSTILE_ENABLED && !turnstileToken) {
    errors.turnstile = "Conclua a verificação de segurança para continuar.";
  }

  return errors;
}

function focusFirstError(errors: Errors) {
  const firstKey = Object.keys(errors)[0] as FieldKey | undefined;
  if (!firstKey) return;

  const wrapper = document.getElementById(FIELD_IDS[firstKey]);
  if (!wrapper) return;

  wrapper.scrollIntoView({ behavior: "smooth", block: "center" });

  const focusable = wrapper.matches("input, select, textarea, button")
    ? wrapper
    : wrapper.querySelector<HTMLElement>("input, select, textarea, button");

  focusable?.focus({ preventScroll: true });
}

export function CompanyForm() {
  const reduceMotion = useReducedMotion();
  const [values, setValues, clearDraft] = useFormDraft<CompanyValues>(
    DRAFT_KEY,
    INITIAL_VALUES,
    DRAFT_OMIT
  );
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [turnstileToken, setTurnstileToken] = React.useState<string | null>(
    null
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = React.useState(0);

  const setField = <K extends keyof CompanyValues>(
    key: K,
    value: CompanyValues[K]
  ) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const toggleFormat = (format: string) => {
    setValues((previous) => ({
      ...previous,
      formats: previous.formats.includes(format)
        ? previous.formats.filter((item) => item !== format)
        : [...previous.formats, format],
    }));
    setErrors((previous) => {
      if (!previous.formats) return previous;
      const next = { ...previous };
      delete next.formats;
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;

    const nextErrors = validate(values, turnstileToken);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      focusFirstError(nextErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setSubmitting(true);

    try {
      await submitCompany(values, turnstileToken);
      clearDraft();
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
      setTurnstileToken(null);
      setTurnstileResetKey((key) => key + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    clearDraft();
    setValues(INITIAL_VALUES);
    setErrors({});
    setTurnstileToken(null);
    setSubmitting(false);
    setSubmitError(null);
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <FormPageShell badge="Cadastro de empresa" shortBadge="Empresa">
        <div className="flex min-h-[62vh] items-center justify-center py-8">
          <FormSuccess
            title="Proposta enviada!"
            description="Recebemos as informações da sua empresa. Nosso time vai analisar o perfil e entrar em contato para alinhar o patrocínio e agendar uma conversa."
            onReset={handleReset}
          />
        </div>
      </FormPageShell>
    );
  }

  return (
    <FormPageShell badge="Cadastro de empresa" shortBadge="Empresa">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-3xl"
      >
        <FormIntro
          eyebrow="Patrocínio e parceria"
          title={
            <>
              Coloque a sua marca no{" "}
              <span className="text-muted-foreground/50">centro do evento.</span>
            </>
          }
          description="Conte sobre a sua empresa e como você quer aparecer no LeadEvent. Vamos desenhar uma parceria que faça sentido para a sua marca."
          meta="Leva cerca de 3 minutos · retorno em até 7 dias"
        />

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { icon: Clock, label: "Análise em até 7 dias" },
            { icon: CalendarCheck, label: "Reunião de 30 minutos" },
            { icon: Handshake, label: "Proposta sob medida" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-[11px] font-medium text-muted-foreground backdrop-blur"
            >
              <Icon className="size-3.5" />
              {label}
            </span>
          ))}
        </div>

        <div className="mt-8">
          <FormCard>
            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-8">
                <FormSection
                  step="01"
                  title="Dados da empresa"
                  description="Informações oficiais para identificarmos a sua marca."
                  icon={Building2}
                >
                  <Field
                    label="Nome fantasia"
                    htmlFor={FIELD_IDS.companyName}
                    error={errors.companyName}
                  >
                    <TextInput
                      id={FIELD_IDS.companyName}
                      name="companyName"
                      value={values.companyName}
                      onChange={(event) =>
                        setField("companyName", event.target.value)
                      }
                      placeholder="Nome que o público conhece"
                      autoComplete="organization"
                      maxLength={80}
                      invalid={Boolean(errors.companyName)}
                    />
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="CNPJ"
                      htmlFor={FIELD_IDS.cnpj}
                      error={errors.cnpj}
                    >
                      <TextInput
                        id={FIELD_IDS.cnpj}
                        name="cnpj"
                        value={values.cnpj}
                        onChange={(event) =>
                          setField("cnpj", formatCNPJ(event.target.value))
                        }
                        placeholder="00.000.000/0000-00"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={18}
                        invalid={Boolean(errors.cnpj)}
                      />
                    </Field>

                    <Field
                      label="E-mail de contato"
                      htmlFor={FIELD_IDS.email}
                      error={errors.email}
                    >
                      <TextInput
                        id={FIELD_IDS.email}
                        name="email"
                        type="email"
                        value={values.email}
                        onChange={(event) =>
                          setField("email", event.target.value)
                        }
                        placeholder="contato@empresa.com.br"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        invalid={Boolean(errors.email)}
                      />
                    </Field>
                  </div>
                </FormSection>

                <FormSection
                  step="02"
                  title="Pessoa de contato"
                  description="Quem vai acompanhar a parceria do lado da empresa."
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Nome do responsável"
                      htmlFor={FIELD_IDS.responsible}
                      error={errors.responsible}
                    >
                      <TextInput
                        id={FIELD_IDS.responsible}
                        name="responsible"
                        value={values.responsible}
                        onChange={(event) =>
                          setField("responsible", event.target.value)
                        }
                        placeholder="Nome e sobrenome"
                        autoComplete="name"
                        invalid={Boolean(errors.responsible)}
                      />
                    </Field>

                    <Field
                      label="Instagram ou site"
                      htmlFor={FIELD_IDS.social}
                      error={errors.social}
                    >
                      <TextInput
                        id={FIELD_IDS.social}
                        name="social"
                        value={values.social}
                        onChange={(event) =>
                          setField("social", event.target.value)
                        }
                        placeholder="@suaempresa ou www.suaempresa.com"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        maxLength={120}
                        invalid={Boolean(errors.social)}
                      />
                    </Field>
                  </div>
                </FormSection>

                <FormSection
                  step="03"
                  title="Sobre o patrocínio"
                  description="Quanto mais contexto, melhor conseguimos propor."
                  icon={Sparkles}
                >
                  <Field
                    label="Existe algum motivo específico para o patrocínio?"
                    htmlFor={FIELD_IDS.description}
                    hint={`${values.description.length}/700`}
                    error={errors.description}
                  >
                    <Textarea
                      id={FIELD_IDS.description}
                      name="description"
                      value={values.description}
                      onChange={(event) =>
                        setField("description", event.target.value)
                      }
                      placeholder="Conte o objetivo da marca, o público que quer alcançar e o que espera do evento..."
                      maxLength={700}
                      invalid={Boolean(errors.description)}
                    />
                  </Field>

                  <Field
                    label="Formato de parceria desejado"
                    htmlFor={FIELD_IDS.formats}
                    hint="Pode escolher mais de um"
                    error={errors.formats}
                  >
                    <div id={FIELD_IDS.formats} className="scroll-mt-24">
                      <ChoiceCards
                        type="checkbox"
                        name="formats"
                        options={PARTNERSHIP_OPTIONS}
                        value={values.formats}
                        onChange={toggleFormat}
                        invalid={Boolean(errors.formats)}
                        ariaLabel="Formato de parceria desejado"
                      />
                    </div>
                  </Field>

                  {values.formats.includes("outro") && (
                    <Field
                      label="Descreva o formato desejado"
                      htmlFor={FIELD_IDS.customFormat}
                      error={errors.customFormat}
                    >
                      <TextInput
                        id={FIELD_IDS.customFormat}
                        name="customFormat"
                        value={values.customFormat}
                        onChange={(event) =>
                          setField("customFormat", event.target.value)
                        }
                        placeholder="Ex.: degustação de produtos"
                        maxLength={30}
                        invalid={Boolean(errors.customFormat)}
                      />
                    </Field>
                  )}

                  <Field
                    label="Disponibilidade para reunião"
                    htmlFor={FIELD_IDS.availability}
                    error={errors.availability}
                  >
                    <div id={FIELD_IDS.availability} className="scroll-mt-24">
                      <ChoiceCards
                        name="availability"
                        options={AVAILABILITY_OPTIONS}
                        value={values.availability}
                        onChange={(value) => setField("availability", value)}
                        invalid={Boolean(errors.availability)}
                        ariaLabel="Disponibilidade para reunião"
                      />
                    </div>
                  </Field>
                </FormSection>

                <FormSection
                  step="04"
                  title="Confirmação"
                  description="Último passo antes de enviar."
                >
                  <ConsentCheckbox
                    id={FIELD_IDS.consent}
                    checked={values.consent}
                    onChange={(checked) => setField("consent", checked)}
                    error={errors.consent}
                  >
                    Autorizo o {brand.product.name} a entrar em contato por
                    e-mail ou telefone sobre esta parceria, nos termos da
                    Política de Privacidade.
                  </ConsentCheckbox>

                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Saiba como tratamos seus dados na{" "}
                    <Link
                      href="/privacidade"
                      className="font-medium text-foreground underline underline-offset-4"
                    >
                      Política de Privacidade
                    </Link>
                    .
                  </p>

                  <div id={FIELD_IDS.turnstile} className="scroll-mt-24">
                    <Turnstile
                      resetKey={turnstileResetKey}
                      onVerify={(token) => {
                        setTurnstileToken(token);
                        if (token) {
                          setErrors((previous) => {
                            if (!previous.turnstile) return previous;
                            const next = { ...previous };
                            delete next.turnstile;
                            return next;
                          });
                        }
                      }}
                    />
                    {errors.turnstile && (
                      <p
                        role="alert"
                        className="mt-2 text-xs font-medium text-red-600"
                      >
                        {errors.turnstile}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-black/[0.07] pt-6">
                    {submitError && (
                      <p
                        role="alert"
                        className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                      >
                        {submitError}
                      </p>
                    )}
                    <SubmitButton
                      type="submit"
                      icon={ArrowRight}
                      className="w-full sm:w-auto"
                      disabled={submitting}
                      aria-busy={submitting}
                    >
                      {submitting ? "Enviando cadastro..." : "Enviar cadastro"}
                    </SubmitButton>
                    <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
                      <Send className="mt-0.5 size-3 shrink-0" />
                      <span>
                        Ao enviar, você declara que as informações são
                        verdadeiras e concorda com a{" "}
                        <Link
                          href="/privacidade"
                          className="font-medium text-foreground underline underline-offset-4"
                        >
                          Política de Privacidade
                        </Link>
                        .
                      </span>
                    </p>
                  </div>
                </FormSection>
              </div>
            </form>
          </FormCard>
        </div>

        <div className="mt-5 flex items-start gap-2 rounded-2xl border border-black/[0.07] bg-white/50 p-4 text-[11px] leading-relaxed text-muted-foreground backdrop-blur">
          <Mail className="mt-0.5 size-3.5 shrink-0" />
          Prefere falar direto com o nosso time? Envie um e-mail para{" "}
          <a
            href="mailto:linkpetroleoegas@gmail.com"
            className="font-medium text-foreground underline underline-offset-2"
          >
            linkpetroleoegas@gmail.com
          </a>
          .
        </div>
      </motion.div>
    </FormPageShell>
  );
}
