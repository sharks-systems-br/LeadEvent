import {
  normalizeInstagram,
  onlyDigits,
  parseVideoLink,
  type VideoLink,
} from "@/lib/form-validation";
import {
  buildSocialUrl,
  type SocialLink,
  type SocialPlatformId,
} from "@/lib/social-links";
import type {
  CompanyPayload,
  Disponibility,
  FollowerRange,
  InfluencerPayload,
  SocialMedia,
} from "./types";

export interface InfluencerFormValues {
  fullName: string;
  instagram: string;
  phone: string;
  description: string;
  niche: string;
  customNiche: string;
  videoLink: string;
  followers: string;
  socials: SocialLink[];
  uf: string;
  city: string;
  manualCity: boolean;
  customCity: string;
}

export interface CompanyFormValues {
  companyName: string;
  cnpj: string;
  email: string;
  responsible: string;
  social: string;
  description: string;
  formats: string[];
  customFormat: string;
  availability: string;
}

const FOLLOWER_RANGE: Record<string, FollowerRange> = {
  "ate-10k": "_UP_TO_10K",
  "10k-50k": "_10K_TO_50K",
  "50k-100k": "_50K_TO_100K",
  "100k-500k": "_100K_TO_500K",
  "500k-1m": "_500K_TO_1M",
  "1m+": "_GT_1M",
};

const SOCIAL_MEDIA: Record<SocialPlatformId, SocialMedia> = {
  instagram: "INSTAGRAM",
  tiktok: "TIKTOK",
  youtube: "YOUTUBE",
  x: "X",
  facebook: "FACEBOOK",
  linkedin: "LINKEDIN",
  twitch: "TWITCH",
  pinterest: "PINTEREST",
  threads: "THREADS",
  site: "SITE",
};

const FORMAT_LABELS: Record<string, string> = {
  cota: "Cota de patrocínio",
  ativacao: "Ativação de marca",
  conteudo: "Conteúdo com influenciadores",
  estande: "Estande ou experiência",
  naming: "Naming rights",
};

const DISPONIBILITY: Record<string, Disponibility> = {
  manha: "MORNING",
  tarde: "AFTERNOON",
  "fim-do-dia": "END_OF_THE_DAY",
  qualquer: "ANY_TIME",
  email: "BY_EMAIL",
};

function videoUrl(link: VideoLink): string {
  if (link.kind === "youtube") {
    return `https://www.youtube.com/watch?v=${link.id}`;
  }

  if (link.kind === "vimeo") {
    return `https://vimeo.com/${link.id}`;
  }

  return link.url;
}

export function buildInfluencerPayload(
  values: InfluencerFormValues,
  filePath?: string
): InfluencerPayload {
  const link = parseVideoLink(values.videoLink);

  const socialMedias = values.socials
    .filter(
      (social) =>
        social.platform !== "" &&
        social.platform !== "instagram" &&
        social.value.trim().length > 0
    )
    .map((social) => {
      const url = buildSocialUrl(social);
      if (!url) return null;

      return {
        socialMedia: SOCIAL_MEDIA[social.platform as SocialPlatformId],
        link: url,
      };
    })
    .filter(
      (social): social is { socialMedia: SocialMedia; link: string } =>
        social !== null
    );

  const payload: InfluencerPayload = {
    name: values.fullName.trim(),
    instagram: normalizeInstagram(values.instagram).toLowerCase(),
    phone: onlyDigits(values.phone),
    reason: values.description.trim(),
    niche: (values.niche === "Outro" ? values.customNiche : values.niche).trim(),
    state: values.uf,
    city: (values.manualCity ? values.customCity : values.city).trim(),
    followerRange: FOLLOWER_RANGE[values.followers],
    confirmContact: true,
  };

  if (filePath) {
    payload.filePath = filePath;
  } else if (link) {
    payload.fileUrl = videoUrl(link);
  }

  if (socialMedias.length > 0) {
    payload.socialMedias = socialMedias;
  }

  return payload;
}

export function buildCompanyPayload(values: CompanyFormValues): CompanyPayload {
  const partnershipFormats = values.formats
    .map((format) =>
      format === "outro" ? values.customFormat.trim() : FORMAT_LABELS[format] ?? format
    )
    .filter((format) => format.length > 0);

  return {
    tradeName: values.companyName.trim(),
    cnpj: onlyDigits(values.cnpj),
    contactEmail: values.email.trim(),
    personName: values.responsible.trim(),
    socialMedia: values.social.trim(),
    reason: values.description.trim(),
    partnershipFormats,
    confirmContact: true,
    disponibility: DISPONIBILITY[values.availability],
  };
}
