import type { Metadata } from "next";
import { CompanyForm } from "@/components/forms/company-form";

export const metadata: Metadata = {
  title: "Cadastro de empresa — LeadEvent",
  description:
    "Patrocine o próximo LeadEvent. Conte sobre a sua marca, o formato de parceria desejado e agende uma conversa com o nosso time.",
};

export default function EmpresaPage() {
  return <CompanyForm />;
}
