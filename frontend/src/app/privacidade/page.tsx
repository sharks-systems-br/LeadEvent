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

const legalBases = [
  {
    purpose: "Receber, organizar e avaliar inscrições de empresas e influenciadores",
    basis: "Procedimentos preliminares de contrato e legítimo interesse",
  },
  {
    purpose: "Entrar em contato sobre a seleção, o evento e a parceria",
    basis: "Consentimento",
  },
  {
    purpose: "Armazenar o vídeo de apresentação enviado pelo influenciador",
    basis: "Consentimento e execução do cadastro",
  },
  {
    purpose: "Prevenir fraudes, abusos e garantir a segurança da plataforma",
    basis: "Legítimo interesse",
  },
  {
    purpose: "Cumprir obrigações legais e responder a autoridades",
    basis: "Cumprimento de obrigação legal ou regulatória",
  },
];

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
        <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur sm:text-[11px]">
          {brand.product.name}
        </span>
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
          Última atualização: {updatedAt}
        </p>

        <div className="mt-8 rounded-2xl border border-black/10 bg-white/75 p-5 text-sm leading-relaxed text-muted-foreground shadow-sm backdrop-blur sm:p-6">
          <p>
            Esta política explica como a{" "}
            <strong className="font-semibold text-foreground">
              {brand.company.name}
            </strong>{" "}
            ({brand.company.shortName}), inscrita no CNPJ{" "}
            <strong className="font-semibold text-foreground">
              {brand.company.cnpj}
            </strong>
            , trata os dados pessoais coletados na plataforma{" "}
            {brand.product.name}. Ela segue a Lei Geral de Proteção de Dados
            (Lei nº 13.709/2018) e o Marco Civil da Internet (Lei nº
            12.965/2014).
          </p>
        </div>

        <div className="mt-10 space-y-10">
          <Section id="controlador" title="1. Quem é o controlador">
            <p>
              O controlador dos dados pessoais é a {brand.company.name} (
              {brand.company.shortName}), empresa de tecnologia e inovação
              responsável pelo desenvolvimento e pela operação do{" "}
              {brand.product.name}.
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong className="font-medium text-foreground">
                  Razão social:
                </strong>{" "}
                {brand.company.name}
              </li>
              <li>
                <strong className="font-medium text-foreground">CNPJ:</strong>{" "}
                {brand.company.cnpj}
              </li>
              <li>
                <strong className="font-medium text-foreground">
                  Endereço:
                </strong>{" "}
                {brand.company.address}
              </li>
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
              Coletamos apenas os dados necessários para receber inscrições,
              avaliar candidaturas e organizar a participação no evento.
            </p>

            <h3 className="pt-2 text-base font-semibold text-foreground">
              2.1 Empresas
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Nome fantasia e CNPJ;</li>
              <li>E-mail de contato e nome do responsável;</li>
              <li>Redes sociais da empresa;</li>
              <li>
                Motivo do interesse, formatos de parceria e disponibilidade.
              </li>
            </ul>

            <h3 className="pt-2 text-base font-semibold text-foreground">
              2.2 Influenciadores
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Nome completo, Instagram e telefone;</li>
              <li>Cidade, estado e nicho de atuação;</li>
              <li>Faixa de seguidores e links de redes sociais;</li>
              <li>Motivo de participação;</li>
              <li>Vídeo de apresentação, quando enviado.</li>
            </ul>

            <h3 className="pt-2 text-base font-semibold text-foreground">
              2.3 Dados técnicos
            </h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Endereço IP, data e hora de acesso, usados para segurança,
                prevenção a abusos e funcionamento da plataforma;
              </li>
              <li>
                Token de sessão armazenado no navegador para manter o acesso ao
                painel administrativo.
              </li>
            </ul>
            <p>
              Não coletamos dados sensíveis (origem racial ou étnica, convicção
              religiosa, opinião política, filiação sindical, dados de saúde,
              biometria ou vida sexual) e não solicitamos dados de crianças.
            </p>
          </Section>

          <Section id="finalidades" title="3. Para que usamos e com qual base legal">
            <p>
              Cada tratamento tem uma finalidade e uma base legal prevista na
              LGPD:
            </p>
            <div className="overflow-hidden rounded-xl border border-black/10 bg-white/70">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Finalidade</th>
                    <th className="px-4 py-3 font-semibold">Base legal</th>
                  </tr>
                </thead>
                <tbody>
                  {legalBases.map((item) => (
                    <tr
                      key={item.purpose}
                      className="border-b border-black/[0.06] last:border-0"
                    >
                      <td className="px-4 py-3 align-top text-foreground/80">
                        {item.purpose}
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground">
                        {item.basis}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Quando a base legal é o consentimento, você pode revogá-lo a
              qualquer momento pelo e-mail do DPO, sem prejuízo dos tratamentos
              já realizados.
            </p>
          </Section>

          <Section id="compartilhamento" title="4. Com quem compartilhamos">
            <p>
              Não vendemos dados pessoais. O compartilhamento ocorre apenas com
              fornecedores necessários para operar a plataforma e com a
              organização do evento, quando aplicável:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <strong className="font-medium text-foreground">
                  Google Drive (Google LLC):
                </strong>{" "}
                armazenamento dos vídeos enviados;
              </li>
              <li>
                <strong className="font-medium text-foreground">
                  Discord (Discord Inc.):
                </strong>{" "}
                notificações internas de novos cadastros e alertas operacionais;
              </li>
              <li>
                <strong className="font-medium text-foreground">
                  Neon (Neon Inc.):
                </strong>{" "}
                banco de dados da aplicação;
              </li>
              <li>
                <strong className="font-medium text-foreground">
                  Provedor de hospedagem:
                </strong>{" "}
                infraestrutura do site e da API;
              </li>
              <li>
                <strong className="font-medium text-foreground">
                  Organização do evento:
                </strong>{" "}
                para avaliação das inscrições e contato com os selecionados;
              </li>
              <li>
                <strong className="font-medium text-foreground">
                  Autoridades públicas:
                </strong>{" "}
                quando houver obrigação legal ou ordem judicial.
              </li>
            </ul>
            <p>
              Esses fornecedores tratam os dados apenas conforme nossas
              instruções e suas próprias políticas de segurança.
            </p>
          </Section>

          <Section id="transferencia" title="5. Transferência internacional">
            <p>
              Alguns fornecedores podem armazenar ou processar dados fora do
              Brasil, inclusive nos Estados Unidos. Nesses casos, a transferência
              segue o art. 33 da LGPD e é amparada por cláusulas contratuais e
              salvaguardas adotadas pelos fornecedores.
            </p>
          </Section>

          <Section id="retencao" title="6. Por quanto tempo guardamos">
            <p>
              Mantemos os dados pelo tempo necessário para cumprir as finalidades
              desta política. As inscrições são guardadas por até 12 meses após o
              evento, salvo se houver obrigação legal, exercício regular de
              direitos ou solicitação de exclusão antes desse prazo.
            </p>
            <p>
              Após o prazo, os dados são eliminados ou anonimizados. Você pode
              solicitar a exclusão a qualquer momento pelo canal do DPO.
            </p>
          </Section>

          <Section id="direitos" title="7. Seus direitos">
            <p>
              Nos termos do art. 18 da LGPD, você pode solicitar:
            </p>
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
              . Responderemos em até 15 dias, podendo pedir informações
              adicionais para confirmar sua identidade e evitar fraudes.
            </p>
          </Section>

          <Section id="seguranca" title="8. Como protegemos os dados">
            <p>
              Adotamos medidas técnicas e administrativas para proteger os dados,
              incluindo:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>uso de HTTPS em todas as comunicações;</li>
              <li>senhas armazenadas com hash Argon2;</li>
              <li>limitação de tentativas de login e de requisições;</li>
              <li>acesso restrito ao painel administrativo;</li>
              <li>controle de acesso aos serviços de banco e armazenamento.</li>
            </ul>
            <p>
              Nenhum sistema é totalmente imune a incidentes. Caso ocorra um
              incidente de segurança relevante, comunicaremos os titulares e a
              ANPD conforme a LGPD.
            </p>
          </Section>

          <Section id="cookies" title="9. Cookies e armazenamento local">
            <p>
              Não utilizamos cookies de publicidade ou de análise de
              comportamento. Usamos o armazenamento local do navegador
              (localStorage) apenas para manter a sessão do painel
              administrativo. Você pode apagar esses dados nas configurações do
              seu navegador.
            </p>
          </Section>

          <Section id="menores" title="10. Menores de idade">
            <p>
              O cadastro de influenciadores é destinado a pessoas com 18 anos ou
              mais. Não coletamos intencionalmente dados de menores. Se
              identificarmos um cadastro de menor de idade, os dados serão
              eliminados.
            </p>
          </Section>

          <Section id="alteracoes" title="11. Alterações desta política">
            <p>
              Podemos atualizar esta política para refletir mudanças na
              plataforma, na legislação ou nos serviços utilizados. A versão
              vigente é sempre a publicada nesta página, com a data de atualização
              no topo. Mudanças relevantes serão comunicadas pelos canais
              oficiais.
            </p>
          </Section>

          <Section id="contato" title="12. Contato">
            <p>
              Para dúvidas, solicitações ou reclamações sobre privacidade, fale
              com nosso encarregado de dados:
            </p>
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
                {brand.company.name} · CNPJ {brand.company.cnpj}
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
