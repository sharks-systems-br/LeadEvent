import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Política de Privacidade - ${brand.product.name}`,
  description: `Como a ${brand.company.name} trata os dados pessoais na plataforma ${brand.product.name}.`,
};

const updatedAt = "7 de novembro de 2026";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="relative min-h-[100dvh] bg-background font-sans">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="bg-grid absolute inset-0 opacity-60" />
        <div className="absolute -left-40 -top-24 size-[34rem] rounded-full bg-violet-500/[0.08] blur-[130px]" />
        <div className="absolute -bottom-32 -right-32 size-[30rem] rounded-full bg-fuchsia-500/[0.06] blur-[120px]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="flex size-9 items-center justify-center rounded-full border border-black/10 bg-white/80 shadow-sm backdrop-blur transition-transform duration-200 group-hover:-translate-x-0.5">
            <ArrowLeft className="size-4" />
          </span>
          Voltar
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-16 pt-4 sm:px-8 sm:pt-8">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Privacidade e proteção de dados
        </p>

        <h1 className="mt-4 text-3xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-4xl">
          Política de Privacidade
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Versão 1.0 · Última atualização: {updatedAt}
        </p>

        <div className="mt-8 rounded-2xl border border-black/10 bg-white/75 p-5 text-sm leading-relaxed text-muted-foreground shadow-sm backdrop-blur sm:p-6">
          <p>
            Esta política resume como a{" "}
            <strong className="font-semibold text-foreground">
              {brand.company.name}
            </strong>{" "}
            ({brand.company.shortName}) trata os dados pessoais coletados no{" "}
            {brand.product.name}, nos termos da Lei Geral de Proteção de Dados
            (Lei nº 13.709/2018).
          </p>
        </div>

        <div className="mt-10 space-y-10">
          <Section id="controlador" title="1. Quem é o controlador">
            <p>
              A {brand.company.name} ({brand.company.shortName}) é a
              controladora dos dados pessoais tratados na plataforma.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong className="font-medium text-foreground">
                  Encarregado de Proteção de Dados (DPO):
                </strong>{" "}
                {brand.company.dpoName} —{" "}
                <a
                  href={`mailto:${brand.company.dpoEmail}`}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  {brand.company.dpoEmail}
                </a>
              </li>
            </ul>
          </Section>

          <Section id="dados" title="2. Quais dados coletamos">
            <p>
              <strong className="font-medium text-foreground">Empresas:</strong>{" "}
              nome fantasia, CNPJ, e-mail, nome do responsável, redes sociais,
              motivo do interesse, formatos de parceria e disponibilidade.
            </p>
            <p>
              <strong className="font-medium text-foreground">
                Influenciadores:
              </strong>{" "}
              nome, Instagram, telefone, cidade, estado, nicho, faixa de
              seguidores, links de redes sociais, motivo de participação e vídeo
              de apresentação.
            </p>
            <p>
              <strong className="font-medium text-foreground">
                Dados técnicos:
              </strong>{" "}
              endereço IP, data e hora de acesso, usados para segurança, e token
              de sessão armazenado no navegador para manter o acesso ao painel.
            </p>
            <p>
              Não coletamos dados sensíveis nem dados de menores. O cadastro de
              influenciadores é destinado a maiores de 18 anos.
            </p>
          </Section>

          <Section
            id="finalidades"
            title="3. Para que usamos e com qual base legal"
          >
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Receber e avaliar inscrições — procedimentos preliminares de
                contrato e legítimo interesse.
              </li>
              <li>
                Entrar em contato sobre seleção, evento e parceria —
                consentimento.
              </li>
              <li>
                Armazenar o vídeo de apresentação — consentimento.
              </li>
              <li>
                Prevenir fraudes e garantir a segurança da plataforma —
                legítimo interesse.
              </li>
              <li>
                Cumprir obrigações legais e responder a autoridades — obrigação
                legal ou regulatória.
              </li>
            </ul>
            <p>
              Quando a base é o consentimento, você pode revogá-lo a qualquer
              momento pelo e-mail do DPO.
            </p>
          </Section>

          <Section id="compartilhamento" title="4. Com quem compartilhamos">
            <p>
              Não vendemos dados pessoais. Compartilhamos apenas com quem é
              necessário para operar a plataforma:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong className="font-medium text-foreground">
                  Google Drive:
                </strong>{" "}
                armazenamento dos vídeos enviados.
              </li>
              <li>
                <strong className="font-medium text-foreground">Discord:</strong>{" "}
                notificações internas de novos cadastros.
              </li>
              <li>
                <strong className="font-medium text-foreground">Neon:</strong>{" "}
                banco de dados da aplicação.
              </li>
              <li>
                <strong className="font-medium text-foreground">
                  Provedor de hospedagem:
                </strong>{" "}
                infraestrutura do site e da API.
              </li>
              <li>
                <strong className="font-medium text-foreground">
                  Organização do evento:
                </strong>{" "}
                avaliação das inscrições e contato com os selecionados.
              </li>
              <li>
                <strong className="font-medium text-foreground">
                  Autoridades públicas:
                </strong>{" "}
                quando houver obrigação legal ou ordem judicial.
              </li>
            </ul>
            <p>
              Alguns fornecedores podem processar dados fora do Brasil,
              inclusive nos Estados Unidos, com salvaguardas contratuais
              previstas no art. 33 da LGPD.
            </p>
          </Section>

          <Section id="retencao" title="5. Por quanto tempo guardamos">
            <p>
              Mantemos os dados por até 12 meses após o evento, salvo obrigação
              legal, exercício regular de direitos ou pedido de exclusão antes
              desse prazo. Depois, os dados são eliminados ou anonimizados.
            </p>
          </Section>

          <Section id="direitos" title="6. Seus direitos">
            <p>Nos termos do art. 18 da LGPD, você pode solicitar:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>confirmação da existência de tratamento;</li>
              <li>acesso aos dados;</li>
              <li>correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>
                anonimização, bloqueio ou eliminação de dados desnecessários ou
                excessivos;
              </li>
              <li>portabilidade, quando aplicável;</li>
              <li>
                informação sobre entidades com as quais os dados foram
                compartilhados;
              </li>
              <li>revogação do consentimento.</li>
            </ul>
            <p>
              Envie a solicitação para{" "}
              <a
                href={`mailto:${brand.company.dpoEmail}`}
                className="font-medium text-foreground underline underline-offset-4"
              >
                {brand.company.dpoEmail}
              </a>
              . A resposta é gratuita e ocorre em até 15 dias, podendo ser
              solicitada confirmação de identidade.
            </p>
          </Section>

          <Section id="seguranca" title="7. Segurança, cookies e menores">
            <p>
              Adotamos HTTPS, hash Argon2 para senhas, limitação de tentativas de
              login e acesso restrito ao painel administrativo. Incidentes
              relevantes são comunicados aos titulares e à ANPD.
            </p>
            <p>
              Não usamos cookies de publicidade ou de análise de comportamento.
              O armazenamento local do navegador é usado apenas para manter a
              sessão do painel administrativo.
            </p>
            <p>
              O cadastro de influenciadores é destinado a maiores de 18 anos. Se
              identificarmos um cadastro de menor, os dados serão eliminados.
            </p>
          </Section>

          <Section id="contato" title="8. Contato">
            <div className="rounded-xl border border-black/10 bg-white/70 p-4">
              <p className="flex items-center gap-2 text-foreground">
                <Mail className="size-4 text-muted-foreground" />
                <a
                  href={`mailto:${brand.company.dpoEmail}`}
                  className="font-medium underline underline-offset-4"
                >
                  {brand.company.dpoEmail}
                </a>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {brand.company.dpoName} — Encarregado de Proteção de Dados
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {brand.company.name}
              </p>
            </div>
            <p>
              Você também pode apresentar reclamação à Autoridade Nacional de
              Proteção de Dados (ANPD), pelo site{" "}
              <a
                href="https://www.gov.br/anpd"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                gov.br/anpd
              </a>
              .
            </p>
          </Section>
        </div>

        <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-6 text-[11px] text-muted-foreground/70">
          <span>{brand.product.name}</span>
          <span>
            {brand.company.shortName} — {brand.company.name}
          </span>
        </footer>
      </main>
    </div>
  );
}
