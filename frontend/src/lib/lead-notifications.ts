export type LeadKind = "influencer" | "company";
export type LeadDecision = "APPROVED" | "REJECTED";
export type NotificationChannel = "whatsapp" | "instagram" | "none";

export interface LeadRecipient {
  kind: LeadKind;
  name: string;
  phone?: string | null;
  instagram?: string | null;
  companyName?: string | null;
  availability?: string | null;
}

const EVENT_DATE = "22 de novembro";

const AVAILABILITY_PHRASES: Record<string, string> = {
  MORNING: "Vamos agendar uma reunião no período da manhã",
  AFTERNOON: "Vamos agendar uma reunião no período da tarde",
  END_OF_THE_DAY: "Vamos agendar uma reunião no fim do dia",
  ANY_TIME: "Vamos agendar uma reunião em qualquer horário",
  BY_EMAIL: "Vamos alinhar os próximos passos por e-mail",
};

export function normalizeWhatsAppNumber(value?: string | null): string | null {
  const digits = (value ?? "").replace(/\D/g, "");

  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.length === 12 || digits.length === 13) {
    return digits.startsWith("55") ? digits : null;
  }

  return null;
}

export function extractInstagramUsername(value?: string | null): string | null {
  const raw = (value ?? "").trim();
  if (!raw) return null;

  const fromUrl = raw.match(/instagram\.com\/([^/?#\s]+)/i);
  if (fromUrl) {
    const username = fromUrl[1].replace(/^@+/, "");
    return /^[A-Za-z0-9._]{1,30}$/.test(username) ? username : null;
  }

  if (/^https?:\/\//i.test(raw)) return null;
  if (/^[\w-]+\.[a-z]{2,}/i.test(raw)) return null;

  const username = raw.replace(/^@+/, "").replace(/[/?#].*$/, "").trim();
  return /^[A-Za-z0-9._]{1,30}$/.test(username) ? username : null;
}

export function buildLeadMessage(
  recipient: LeadRecipient,
  decision: LeadDecision
): string {
  const name = recipient.name.trim() || "tudo bem";

  if (recipient.kind === "influencer") {
    if (decision === "APPROVED") {
      return `Olá, ${name}! Seu cadastro foi aprovado e sua presença está confirmada na Feijoada dos Influenciadores, no dia ${EVENT_DATE}. Contamos com você! Qualquer dúvida, é só responder por aqui.`;
    }

    return `Olá, ${name}! Agradecemos muito pela sua inscrição. Infelizmente as vagas desta edição já foram preenchidas. Obrigado pelo interesse e esperamos você nas próximas edições!`;
  }

  const company = recipient.companyName?.trim();
  const subject = company ? `A inscrição da ${company} foi aprovada.` : "Sua inscrição foi aprovada.";

  if (decision === "APPROVED") {
    const nextStep =
      AVAILABILITY_PHRASES[recipient.availability ?? ""] ??
      "Vamos agendar uma reunião";

    return `Olá, ${name}! ${subject} ${nextStep} para alinhar a parceria da Feijoada dos Influenciadores, no dia ${EVENT_DATE}. Qual horário fica melhor para você?`;
  }

  const companySubject = company
    ? `Agradecemos o interesse da ${company} em patrocinar a Feijoada dos Influenciadores.`
    : "Agradecemos o seu interesse em patrocinar a Feijoada dos Influenciadores.";

  return `Olá, ${name}! ${companySubject} Infelizmente as cotas desta edição já foram preenchidas. Obrigado pelo contato e conte com a gente nas próximas edições!`;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildInstagramLink(username: string): string {
  return `https://ig.me/m/${username}`;
}

export function notifyLead(
  recipient: LeadRecipient,
  decision: LeadDecision,
  onCopied?: (message: string) => void
): NotificationChannel {
  const message = buildLeadMessage(recipient, decision);
  const phone = normalizeWhatsAppNumber(recipient.phone);

  if (phone) {
    window.open(buildWhatsAppLink(phone, message), "_blank", "noopener,noreferrer");
    return "whatsapp";
  }

  const username = extractInstagramUsername(recipient.instagram);
  if (!username) return "none";

  const copy = navigator.clipboard.writeText(message);
  window.open(buildInstagramLink(username), "_blank", "noopener,noreferrer");

  if (onCopied) {
    void copy.then(() => onCopied(message)).catch(() => undefined);
  }

  return "instagram";
}
