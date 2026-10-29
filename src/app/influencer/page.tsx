import type { Metadata } from "next";
import { RoleComingSoon } from "@/components/role-coming-soon";

export const metadata: Metadata = {
  title: "Cadastro de influencer — LeadEvent",
};

export default function InfluencerPage() {
  return <RoleComingSoon role="influencer" />;
}
