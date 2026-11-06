export type FollowerRange =
  | "_UP_TO_10K"
  | "_10K_TO_50K"
  | "_50K_TO_100K"
  | "_100K_TO_500K"
  | "_500K_TO_1M"
  | "_GT_1M";

export type SocialMedia =
  | "INSTAGRAM"
  | "TIKTOK"
  | "YOUTUBE"
  | "FACEBOOK"
  | "LINKEDIN"
  | "TWITCH"
  | "PINTEREST"
  | "THREADS"
  | "SITE"
  | "X";

export type Disponibility =
  | "MORNING"
  | "AFTERNOON"
  | "END_OF_THE_DAY"
  | "ANY_TIME"
  | "BY_EMAIL";

export interface SocialMediaPayload {
  socialMedia: SocialMedia;
  link: string;
}

export interface InfluencerPayload {
  name: string;
  instagram: string;
  phone: string;
  reason: string;
  niche: string;
  state: string;
  city: string;
  followerRange: FollowerRange;
  confirmContact: true;
  socialMedias?: SocialMediaPayload[];
  filePath?: string;
  fileUrl?: string;
}

export interface CompanyPayload {
  tradeName: string;
  cnpj: string;
  contactEmail: string;
  personName: string;
  socialMedia: string;
  reason: string;
  partnershipFormats: string[];
  confirmContact: true;
  disponibility: Disponibility;
}
