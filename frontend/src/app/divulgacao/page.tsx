import type { Metadata } from "next";
import { DivulgationHub } from "@/components/divulgacao/divulgation-hub";

export const metadata: Metadata = {
  title: "Central de Divulgação - LeadEvent",
  description:
    "Links com UTM, QR Code, disparo rápido e textos prontos para divulgar o LeadEvent.",
};

export default function DivulgacaoPage() {
  return <DivulgationHub />;
}
