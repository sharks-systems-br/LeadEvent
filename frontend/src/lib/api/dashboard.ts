import { api } from "./client";
import type { Disponibility, FollowerRange, SocialMedia } from "./types";

export type LeadStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface CompanyRecord {
  id: string;
  tradeName: string;
  cnpj: string;
  contactEmail: string;
  personName: string;
  socialMedia: string;
  reason: string;
  disponibility: Disponibility;
  partnershipFormats: { format: string }[];
  createdAt: string;
  status?: LeadStatus;
}

export interface InfluencerRecord {
  id: string;
  name: string;
  instagram: string;
  phone: string;
  reason: string;
  niche: string;
  videoUrl: string;
  state: string;
  city: string;
  followerRange: FollowerRange;
  socialMedias: { socialMedia: SocialMedia; link: string }[];
  createdAt: string;
  status?: LeadStatus;
}

export type CompanyLead = CompanyRecord & { status: LeadStatus };
export type InfluencerLead = InfluencerRecord & { status: LeadStatus };

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Recusado",
};

export const DISPONIBILITY_LABELS: Record<Disponibility, string> = {
  MORNING: "Manhã",
  AFTERNOON: "Tarde",
  END_OF_THE_DAY: "Fim do dia",
  ANY_TIME: "Qualquer horário",
  BY_EMAIL: "Por e-mail",
};

export const FOLLOWER_RANGE_LABELS: Record<FollowerRange, string> = {
  _UP_TO_10K: "Até 10 mil seguidores",
  _10K_TO_50K: "10 mil a 50 mil seguidores",
  _50K_TO_100K: "50 mil a 100 mil seguidores",
  _100K_TO_500K: "100 mil a 500 mil seguidores",
  _500K_TO_1M: "500 mil a 1 milhão de seguidores",
  _GT_1M: "Mais de 1 milhão de seguidores",
};

export const SOCIAL_MEDIA_LABELS: Record<SocialMedia, string> = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  FACEBOOK: "Facebook",
  LINKEDIN: "LinkedIn",
  TWITCH: "Twitch",
  PINTEREST: "Pinterest",
  THREADS: "Threads",
  SITE: "Site",
  X: "X",
};

export async function getCompanies(): Promise<CompanyRecord[]> {
  const response = await api.get<CompanyRecord[]>("/companies");
  return response.data;
}

export async function getInfluencers(): Promise<InfluencerRecord[]> {
  const response = await api.get<InfluencerRecord[]>("/influencers");
  return response.data;
}

export function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
