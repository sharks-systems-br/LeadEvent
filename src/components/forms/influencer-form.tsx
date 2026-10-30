"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  MapPin,
  PenLine,
  Send,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import {
  ChoiceCards,
  ConsentCheckbox,
  Field,
  FormSection,
  SelectInput,
  SubmitButton,
  TextInput,
  Textarea,
  UploadDropzone,
  type ChoiceOption,
} from "@/components/forms/form-controls";
import {
  FormCard,
  FormIntro,
  FormPageShell,
  FormSuccess,
} from "@/components/forms/form-shell";
import {
  VideoPreview,
  type PreviewSource,
} from "@/components/forms/video-preview";
import {
  formatPhone,
  isVideoFile,
  isValidFullName,
  isValidInstagram,
  isValidPhone,
  normalizeInstagram,
  parseVideoLink,
} from "@/lib/form-validation";

const UF_LIST = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
] as const;

const NICHES = [
  "Beleza e maquiagem",
  "Moda e estilo",
  "Fitness e bem-estar",
  "Gastronomia",
  "Viagem",
  "Tecnologia",
  "Games",
  "Lifestyle",
  "Humor",
  "Música e dança",
  "Educação",
  "Outro",
];

const FOLLOWER_OPTIONS: ChoiceOption[] = [
  { value: "ate-10k", label: "Até 10 mil" },
  { value: "10k-50k", label: "10 mil a 50 mil" },
  { value: "50k-100k", label: "50 mil a 100 mil" },
  { value: "100k-500k", label: "100 mil a 500 mil" },
  { value: "500k-1m", label: "500 mil a 1 milhão" },
  { value: "1m+", label: "Mais de 1 milhão" },
];

interface InfluencerValues {
  fullName: string;
  instagram: string;
  phone: string;
  description: string;
  niche: string;
  customNiche: string;
  videoLink: string;
  followers: string;
  otherSocial: string;
  uf: string;
  city: string;
  manualCity: boolean;
  customCity: string;
  consent: boolean;
}

type FieldKey = keyof InfluencerValues | "video";
type Errors = Partial<Record<FieldKey, string>>;

const INITIAL_VALUES: InfluencerValues = {
  fullName: "",
  instagram: "",
  phone: "",
  description: "",
  niche: "",
  customNiche: "",
  videoLink: "",
  followers: "",
  otherSocial: "",
  uf: "",
  city: "",
  manualCity: false,
  customCity: "",
  consent: false,
};

const FIELD_IDS: Record<FieldKey, string> = {
  fullName: "influencer-full-name",
  instagram: "influencer-instagram",
  phone: "influencer-phone",
  description: "influencer-description",
  niche: "influencer-niche",
  customNiche: "influencer-custom-niche",
  video: "influencer-video",
  videoLink: "influencer-video-link",
  followers: "influencer-followers",
  otherSocial: "influencer-other-social",
  uf: "influencer-uf",
  city: "influencer-city",
  manualCity: "influencer-custom-city",
  customCity: "influencer-custom-city",
  consent: "influencer-consent",
};

function validate(values: InfluencerValues, hasFile: boolean): Errors {
  const errors: Errors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Informe o seu nome completo.";
  } else if (!isValidFullName(values.fullName)) {
    errors.fullName = "Use nome e sobrenome, apenas com letras.";
  }

  if (!values.instagram.trim()) {
    errors.instagram = "Informe o seu @ do Instagram.";
  } else if (!isValidInstagram(values.instagram)) {
    errors.instagram = "Use um @ válido, com até 30 caracteres.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Informe o seu telefone com DDD.";
  } else if (!isValidPhone(values.phone)) {
    errors.phone = "Informe um telefone válido com DDD.";
  }

  if (!values.description.trim()) {
    errors.description = "Conte por que você quer participar.";
  } else if (values.description.trim().length < 30) {
    errors.description = "Escreva pelo menos 30 caracteres.";
  }

  if (!values.niche) {
    errors.niche = "Selecione o seu nicho de conteúdo.";
  } else if (values.niche === "Outro" && !values.customNiche.trim()) {
    errors.customNiche = "Descreva o seu nicho.";
  }

  const link = values.videoLink.trim();
  if (link && !parseVideoLink(link)) {
    errors.videoLink =
      "Use um link do YouTube, Vimeo ou um arquivo de vídeo direto.";
  } else if (!link && !hasFile) {
    errors.video = "Adicione o link do seu vídeo ou envie um arquivo.";
  }

  if (!values.followers) {
    errors.followers = "Selecione a sua faixa de seguidores.";
  }

  if (!values.uf) {
    errors.uf = "Selecione o seu estado.";
  }

  if (values.manualCity) {
    if (values.customCity.trim().length < 2) {
      errors.customCity = "Informe a sua cidade ou região.";
    }
  } else if (!values.city) {
    errors.city = "Selecione a sua cidade.";
  }

  if (!values.consent) {
    errors.consent = "É necessário autorizar o contato para continuar.";
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

export function InfluencerForm() {
  const reduceMotion = useReducedMotion();
  const [values, setValues] = React.useState<InfluencerValues>(INITIAL_VALUES);
  const [errors, setErrors] = React.useState<Errors>({});
  const [video, setVideo] = React.useState<{ file: File; url: string } | null>(
    null
  );
  const [submitted, setSubmitted] = React.useState(false);
  const [videoFormat, setVideoFormat] = React.useState<string | null>(null);
  const [cities, setCities] = React.useState<string[]>([]);
  const [citiesStatus, setCitiesStatus] = React.useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [cityRequest, setCityRequest] = React.useState(0);

  const objectUrlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // IBGE municipality list for the selected state.
  React.useEffect(() => {
    if (!values.uf) return;

    const controller = new AbortController();

    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${encodeURIComponent(
        values.uf
      )}/municipios?orderBy=nome`,
      { signal: controller.signal }
    )
      .then((response) => {
        if (!response.ok) throw new Error("IBGE request failed");
        return response.json() as Promise<Array<{ nome: string }>>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setCities(data.map((city) => city.nome));
        setCitiesStatus("ready");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setCitiesStatus("error");
      });

    return () => controller.abort();
  }, [values.uf, cityRequest]);

  const setField = <K extends keyof InfluencerValues>(
    key: K,
    value: InfluencerValues[K]
  ) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const next = { ...previous };
      delete next[key];
      return next;
    });
  };

  const clearErrors = (...keys: FieldKey[]) => {
    setErrors((previous) => {
      if (!keys.some((key) => previous[key])) return previous;
      const next = { ...previous };
      for (const key of keys) delete next[key];
      return next;
    });
  };

  const handleUfChange = (uf: string) => {
    setValues((previous) => ({ ...previous, uf, city: "" }));
    setErrors((previous) => {
      const next = { ...previous };
      delete next.uf;
      delete next.city;
      return next;
    });
    setCities([]);
    setCitiesStatus(uf ? "loading" : "idle");
  };

  const toggleManualCity = () => {
    setValues((previous) => ({
      ...previous,
      manualCity: !previous.manualCity,
      city: "",
      customCity: "",
    }));
    clearErrors("city", "customCity");
  };

  const handleFileChange = (file: File | null) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!file) {
      setVideo(null);
      return;
    }

    if (!isVideoFile(file)) {
      setErrors((previous) => ({
        ...previous,
        video: "Envie um arquivo de vídeo (MP4, MOV, WEBM...).",
      }));
      return;
    }

    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setVideo({ file, url });
    setValues((previous) => ({ ...previous, videoLink: "" }));
    clearErrors("video", "videoLink");
  };

  const clearVideo = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setVideo(null);
    setValues((previous) => ({ ...previous, videoLink: "" }));
    clearErrors("video", "videoLink");
  };

  const linkPreview = React.useMemo(
    () => parseVideoLink(values.videoLink),
    [values.videoLink]
  );

  const preview: PreviewSource | null = video
    ? {
        kind: "upload",
        url: video.url,
        label: "Arquivo enviado",
        fileName: video.file.name,
        fileSize: video.file.size,
      }
    : linkPreview;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values, Boolean(video));
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      focusFirstError(nextErrors);
      return;
    }

    setErrors({});
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setValues(INITIAL_VALUES);
    setErrors({});
    setVideo(null);
    setCities([]);
    setCitiesStatus("idle");
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <FormPageShell badge="Cadastro de influencer" shortBadge="Influencer">
        <div className="flex min-h-[62vh] items-center justify-center py-8">
          <FormSuccess
            title="Cadastro enviado!"
            description="Recebemos o seu perfil. Nossa equipe vai analisar o seu vídeo e entrar em contato pelo Instagram ou telefone informado."
            onReset={handleReset}
          />
        </div>
      </FormPageShell>
    );
  }

  return (
    <FormPageShell badge="Cadastro de influencer" shortBadge="Influencer">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-start lg:gap-12">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="min-w-0"
        >
          <FormIntro
            eyebrow="Seleção de criadores"
            title={
              <>
                Candidate-se a uma vaga{" "}
                <span className="text-muted-foreground/50">no evento.</span>
              </>
            }
            description="Conte quem você é, mostre o seu conteúdo e concorra a uma vaga entre os criadores selecionados para o próximo LeadEvent."
            meta="Leva cerca de 3 minutos · resposta em até 7 dias"
          />

          <div className="mt-8">
            <FormCard>
              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-8">
                  <FormSection
                    step="01"
                    title="Dados pessoais"
                    description="Como podemos falar com você."
                  >
                    <Field
                      label="Nome completo"
                      htmlFor={FIELD_IDS.fullName}
                      error={errors.fullName}
                    >
                      <TextInput
                        id={FIELD_IDS.fullName}
                        name="fullName"
                        value={values.fullName}
                        onChange={(event) =>
                          setField("fullName", event.target.value)
                        }
                        placeholder="Ana Beatriz Souza"
                        autoComplete="name"
                        invalid={Boolean(errors.fullName)}
                      />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        label="Instagram"
                        htmlFor={FIELD_IDS.instagram}
                        error={errors.instagram}
                      >
                        <TextInput
                          id={FIELD_IDS.instagram}
                          name="instagram"
                          value={values.instagram}
                          onChange={(event) =>
                            setField(
                              "instagram",
                              event.target.value.replace(/^@/, "")
                            )
                          }
                          onBlur={(event) =>
                            setField(
                              "instagram",
                              normalizeInstagram(event.target.value)
                            )
                          }
                          placeholder="seu.perfil"
                          leading="@"
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          autoComplete="off"
                          invalid={Boolean(errors.instagram)}
                        />
                      </Field>

                      <Field
                        label="Telefone"
                        htmlFor={FIELD_IDS.phone}
                        hint="Com DDD"
                        error={errors.phone}
                      >
                        <TextInput
                          id={FIELD_IDS.phone}
                          name="phone"
                          value={values.phone}
                          onChange={(event) =>
                            setField("phone", formatPhone(event.target.value))
                          }
                          placeholder="(11) 99999-9999"
                          inputMode="tel"
                          autoComplete="tel"
                          maxLength={15}
                          invalid={Boolean(errors.phone)}
                        />
                      </Field>
                    </div>
                  </FormSection>

                  <FormSection
                    step="02"
                    title="Sobre o seu conteúdo"
                    description="Isso ajuda a entender se o seu perfil combina com o evento."
                  >
                    <Field
                      label="Por que você quer participar deste evento?"
                      htmlFor={FIELD_IDS.description}
                      hint={`${values.description.length}/600`}
                      error={errors.description}
                    >
                      <Textarea
                        id={FIELD_IDS.description}
                        name="description"
                        value={values.description}
                        onChange={(event) =>
                          setField("description", event.target.value)
                        }
                        placeholder="Conte o que te motiva, que tipo de conteúdo você cria e o que espera viver no evento..."
                        maxLength={600}
                        invalid={Boolean(errors.description)}
                      />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        label="Nicho de conteúdo"
                        htmlFor={FIELD_IDS.niche}
                        error={errors.niche}
                      >
                        <SelectInput
                          id={FIELD_IDS.niche}
                          name="niche"
                          value={values.niche}
                          onChange={(event) =>
                            setField("niche", event.target.value)
                          }
                          placeholder="Selecione o nicho"
                          invalid={Boolean(errors.niche)}
                        >
                          {NICHES.map((niche) => (
                            <option key={niche} value={niche}>
                              {niche}
                            </option>
                          ))}
                        </SelectInput>
                      </Field>

                      {values.niche === "Outro" && (
                        <Field
                          label="Qual é o seu nicho?"
                          htmlFor={FIELD_IDS.customNiche}
                          error={errors.customNiche}
                        >
                          <TextInput
                            id={FIELD_IDS.customNiche}
                            name="customNiche"
                            value={values.customNiche}
                            onChange={(event) =>
                              setField("customNiche", event.target.value)
                            }
                            placeholder="Ex.: artesanato e DIY"
                            maxLength={60}
                            invalid={Boolean(errors.customNiche)}
                          />
                        </Field>
                      )}
                    </div>
                  </FormSection>

                  <FormSection
                    step="03"
                    title="Vídeo de apresentação"
                    description="Escolha uma das opções. O vídeo aparece na prévia ao lado."
                    icon={Video}
                  >
                    <Field
                      label="Link do vídeo"
                      htmlFor={FIELD_IDS.videoLink}
                      hint="YouTube, Vimeo ou link direto"
                      error={errors.videoLink}
                    >
                      <TextInput
                        id={FIELD_IDS.videoLink}
                        name="videoLink"
                        value={values.videoLink}
                        onChange={(event) => {
                          setField("videoLink", event.target.value);
                          clearErrors("video");
                          if (event.target.value.trim() && video) {
                            handleFileChange(null);
                          }
                        }}
                        placeholder="https://youtube.com/shorts/..."
                        inputMode="url"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        invalid={Boolean(errors.videoLink)}
                      />
                    </Field>

                    <div
                      id={FIELD_IDS.video}
                      className="space-y-2 scroll-mt-24"
                    >
                      <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
                        <span className="h-px flex-1 bg-black/[0.07]" />
                        ou envie um arquivo
                        <span className="h-px flex-1 bg-black/[0.07]" />
                      </div>

                      <UploadDropzone
                        id="influencer-video-file"
                        file={video?.file ?? null}
                        onFileChange={handleFileChange}
                        onReject={(message) =>
                          setErrors((previous) => ({
                            ...previous,
                            video: message,
                          }))
                        }
                        invalid={Boolean(errors.video)}
                      />

                      {errors.video && (
                        <p
                          role="alert"
                          className="text-xs font-medium text-red-600"
                        >
                          {errors.video}
                        </p>
                      )}
                    </div>

                    <p className="flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
                      <Clock className="mt-0.5 size-3.5 shrink-0" />
                      Vídeos de até 2 minutos ajudam na avaliação. O envio de
                      uma opção substitui a outra.
                    </p>

                    <div className="lg:hidden">
                      <p className="mb-2 text-sm font-medium text-foreground">
                        Prévia do vídeo
                      </p>
                      <VideoPreview
                        source={preview}
                        onClear={clearVideo}
                        onFormatChange={setVideoFormat}
                      />
                    </div>
                  </FormSection>

                  <FormSection
                    step="04"
                    title="Alcance e presença"
                    description="Onde o seu público está."
                  >
                    <Field
                      label="Faixa de seguidores"
                      htmlFor={FIELD_IDS.followers}
                      error={errors.followers}
                    >
                      <div id={FIELD_IDS.followers} className="scroll-mt-24">
                        <ChoiceCards
                          name="followers"
                          options={FOLLOWER_OPTIONS}
                          value={values.followers}
                          onChange={(value) => setField("followers", value)}
                          invalid={Boolean(errors.followers)}
                          ariaLabel="Faixa de seguidores"
                        />
                      </div>
                    </Field>

                    <Field
                      label="Outra rede social"
                      htmlFor={FIELD_IDS.otherSocial}
                      optional
                    >
                      <TextInput
                        id={FIELD_IDS.otherSocial}
                        name="otherSocial"
                        value={values.otherSocial}
                        onChange={(event) =>
                          setField("otherSocial", event.target.value)
                        }
                        placeholder="@seu.perfil no TikTok"
                        maxLength={80}
                        autoCapitalize="none"
                        autoCorrect="off"
                      />
                    </Field>
                  </FormSection>

                  <FormSection
                    step="05"
                    title="Cidade e região"
                    description="Usamos a lista oficial de municípios do IBGE."
                    icon={MapPin}
                  >
                    <div className="grid gap-5 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
                      <Field
                        label="Estado"
                        htmlFor={FIELD_IDS.uf}
                        error={errors.uf}
                      >
                        <SelectInput
                          id={FIELD_IDS.uf}
                          name="uf"
                          value={values.uf}
                          onChange={(event) => handleUfChange(event.target.value)}
                          placeholder="UF"
                          invalid={Boolean(errors.uf)}
                        >
                          {UF_LIST.map((uf) => (
                            <option key={uf} value={uf}>
                              {uf}
                            </option>
                          ))}
                        </SelectInput>
                      </Field>

                      {values.manualCity ? (
                        <Field
                          label="Cidade ou região"
                          htmlFor={FIELD_IDS.customCity}
                          error={errors.customCity}
                        >
                          <TextInput
                            id={FIELD_IDS.customCity}
                            name="customCity"
                            value={values.customCity}
                            onChange={(event) =>
                              setField("customCity", event.target.value)
                            }
                            placeholder="Ex.: Grande São Paulo"
                            maxLength={80}
                            invalid={Boolean(errors.customCity)}
                          />
                        </Field>
                      ) : (
                        <Field
                          label="Cidade"
                          htmlFor={FIELD_IDS.city}
                          error={errors.city}
                          hint={
                            values.uf && citiesStatus === "loading"
                              ? "Carregando..."
                              : undefined
                          }
                        >
                          <SelectInput
                            id={FIELD_IDS.city}
                            name="city"
                            value={values.city}
                            onChange={(event) =>
                              setField("city", event.target.value)
                            }
                            placeholder={
                              !values.uf
                                ? "Escolha o estado primeiro"
                                : citiesStatus === "loading"
                                  ? "Carregando cidades..."
                                  : citiesStatus === "error"
                                    ? "Não foi possível carregar"
                                    : "Selecione a cidade"
                            }
                            disabled={
                              !values.uf ||
                              citiesStatus === "loading" ||
                              citiesStatus === "error"
                            }
                            invalid={Boolean(errors.city)}
                          >
                            {cities.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </SelectInput>
                        </Field>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <button
                        type="button"
                        onClick={toggleManualCity}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <PenLine className="size-3.5" />
                        {values.manualCity
                          ? "Escolher a cidade na lista"
                          : "Minha cidade não está na lista"}
                      </button>

                      {citiesStatus === "error" && !values.manualCity && (
                        <button
                          type="button"
                          onClick={() => {
                            setCitiesStatus("loading");
                            setCityRequest((value) => value + 1);
                          }}
                          className="text-xs font-semibold text-foreground underline underline-offset-4"
                        >
                          Tentar novamente
                        </button>
                      )}
                    </div>
                  </FormSection>

                  <FormSection
                    step="06"
                    title="Confirmação"
                    description="Último passo antes de enviar."
                  >
                    <ConsentCheckbox
                      id={FIELD_IDS.consent}
                      checked={values.consent}
                      onChange={(checked) => setField("consent", checked)}
                      error={errors.consent}
                    >
                      Autorizo o LeadEvent a entrar em contato por e-mail ou
                      WhatsApp sobre esta seleção e o evento. Meus dados não
                      serão compartilhados com terceiros.
                    </ConsentCheckbox>

                    <div className="border-t border-black/[0.07] pt-6">
                      <SubmitButton
                        type="submit"
                        icon={ArrowRight}
                        className="w-full sm:w-auto"
                      >
                        Enviar cadastro
                      </SubmitButton>
                      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Send className="size-3" />
                        Ao enviar, você concorda com o uso dos dados apenas para
                        contato sobre o evento.
                      </p>
                    </div>
                  </FormSection>
                </div>
              </form>
            </FormCard>
          </div>
        </motion.div>

        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="hidden min-w-0 lg:sticky lg:top-6 lg:block lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-1 lg:[scrollbar-width:thin]"
        >
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Prévia do vídeo
              </p>
              <p className="text-[11px] text-muted-foreground">
                Atualiza em tempo real
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground backdrop-blur">
              {videoFormat ?? "9:16"}
            </span>
          </div>

          <VideoPreview
            source={preview}
            onClear={clearVideo}
            onFormatChange={setVideoFormat}
          />

          <div className="mt-5 rounded-2xl border border-black/10 bg-white/60 p-4 backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Para um bom vídeo
            </p>
            <ul className="mt-3 space-y-2.5">
              {[
                "Grave na vertical, com boa luz e áudio limpo.",
                "Diga seu nome e seu nicho nos primeiros segundos.",
                "Mantenha o vídeo com até 2 minutos.",
              ].map((tip) => (
                <li
                  key={tip}
                  className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground"
                >
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[9px] font-semibold text-foreground">
                    ✓
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Users className="size-3.5" />
            Todos os perfis passam por curadoria antes do evento.
          </p>
        </motion.aside>
      </div>
    </FormPageShell>
  );
}
