import type { Metadata } from "next";
import { RoleComingSoon } from "@/components/role-coming-soon";

export const metadata: Metadata = {
  title: "Cadastro de empresa — LeadEvent",
};

export default function EmpresaPage() {
  return <RoleComingSoon role="empresa" />;
}
