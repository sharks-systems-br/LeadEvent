import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth/require-auth";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Painel — LeadEvent",
  description:
    "Acompanhe os cadastros de empresas e influencers recebidos pelo LeadEvent.",
};

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardView />
    </RequireAuth>
  );
}
