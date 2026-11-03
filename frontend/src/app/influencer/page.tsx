import type { Metadata } from "next";
import { InfluencerForm } from "@/components/forms/influencer-form";

export const metadata: Metadata = {
  title: "Cadastro de influencer — LeadEvent",
  description:
    "Candidate-se a uma vaga no próximo LeadEvent. Conte seu nicho, mostre seu conteúdo e envie seu vídeo de apresentação.",
};

export default function InfluencerPage() {
  return <InfluencerForm />;
}
