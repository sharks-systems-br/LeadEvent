import { api } from "./client";
import type { Disponibility, FollowerRange, SocialMedia } from "./types";

export type LeadStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REFUSED";

export interface LeadCounts {
  total: number;
  PENDING: number;
  APPROVED: number;
  REJECTED: number;
}

interface CountsResponse {
  total: number;
  PENDING: number;
  APPROVED: number;
  REFUSED: number;
}

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
  approvalStatus?: ApprovalStatus;
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
  approvalStatus?: ApprovalStatus;
  status?: LeadStatus;
}

export type CompanyLead = CompanyRecord & { status: LeadStatus };
export type InfluencerLead = InfluencerRecord & { status: LeadStatus };

export interface LeadListParams {
  page?: number;
  perPage?: number;
  approvalStatus?: ApprovalStatus;
  disponibility?: Disponibility;
  partnershipFormat?: string;
  text?: string;
  followerRange?: FollowerRange;
  niche?: string;
  state?: string;
}

const PER_PAGE = 20;
const MAX_PAGES = 50;

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

function toLeadStatus(status?: ApprovalStatus): LeadStatus {
  if (status === "REFUSED") return "REJECTED";
  return status ?? "PENDING";
}

function toApprovalStatus(status: LeadStatus): ApprovalStatus {
  return status === "REJECTED" ? "REFUSED" : status;
}

function mapCompany(record: CompanyRecord): CompanyLead {
  return {
    ...record,
    status: record.status ?? toLeadStatus(record.approvalStatus),
  };
}

function mapInfluencer(record: InfluencerRecord): InfluencerLead {
  return {
    ...record,
    status: record.status ?? toLeadStatus(record.approvalStatus),
  };
}

function mapCounts(counts: CountsResponse): LeadCounts {
  return {
    total: counts.total,
    PENDING: counts.PENDING,
    APPROVED: counts.APPROVED,
    REJECTED: counts.REFUSED,
  };
}

export function countLeads<T extends { status: LeadStatus }>(
  items: T[],
): LeadCounts {
  const counts: LeadCounts = {
    total: items.length,
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
  };

  for (const item of items) {
    counts[item.status] += 1;
  }

  return counts;
}

export async function getCompanies(
  params?: LeadListParams,
): Promise<CompanyLead[]> {
  const response = await api.get<CompanyRecord[]>("/companies", { params });
  return response.data.map(mapCompany);
}

export async function getInfluencers(
  params?: LeadListParams,
): Promise<InfluencerLead[]> {
  const response = await api.get<InfluencerRecord[]>("/influencers", { params });
  return response.data.map(mapInfluencer);
}

export async function getAllCompanies(): Promise<CompanyLead[]> {
  const companies: CompanyLead[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await getCompanies({ page, perPage: PER_PAGE });
    companies.push(...batch);

    if (batch.length < PER_PAGE) break;
  }

  return companies;
}

export async function getAllInfluencers(): Promise<InfluencerLead[]> {
  const influencers: InfluencerLead[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await getInfluencers({ page, perPage: PER_PAGE });
    influencers.push(...batch);

    if (batch.length < PER_PAGE) break;
  }

  return influencers;
}

export async function getCompanyCounts(): Promise<LeadCounts> {
  const response = await api.get<CountsResponse>("/companies/counts");
  return mapCounts(response.data);
}

export async function getInfluencerCounts(): Promise<LeadCounts> {
  const response = await api.get<CountsResponse>("/influencers/counts");
  return mapCounts(response.data);
}

export async function updateCompanyStatus(
  id: string,
  status: LeadStatus,
): Promise<CompanyLead> {
  const response = await api.put<CompanyRecord>(`/companies/${id}/status`, {
    approvalStatus: toApprovalStatus(status),
  });

  return mapCompany(response.data);
}

export async function updateInfluencerStatus(
  id: string,
  status: LeadStatus,
): Promise<InfluencerLead> {
  const response = await api.put<InfluencerRecord>(
    `/influencers/${id}/status`,
    { approvalStatus: toApprovalStatus(status) },
  );

  return mapInfluencer(response.data);
}

export function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}
