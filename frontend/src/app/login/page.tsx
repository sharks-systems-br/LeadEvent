import type { Metadata } from "next";
import { LoginView } from "@/components/auth/login-view";

export const metadata: Metadata = {
  title: "Entrar — LeadEvent",
  description:
    "Acesse a plataforma LeadEvent com sua conta para acompanhar leads, eventos e conexões.",
};

export default function LoginPage() {
  return <LoginView />;
}
