import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Painel — LeadEvent",
  description:
    "Acompanhe os cadastros de empresas e influencers recebidos pelo LeadEvent.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
