import type { Metadata } from "next";
import { AuthUI } from "@/components/ui/auth-ui";

export const metadata: Metadata = {
  title: "Entrar — LeadEvent",
  description:
    "Acesse a plataforma LeadEvent com sua conta para acompanhar leads, eventos e conexões.",
};

export default function LoginPage() {
  return <AuthUI />;
}
