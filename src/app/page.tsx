import { SignInPage, type Testimonial } from "@/components/ui/sign-in";

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&h=96&q=80",
    name: "Marina Alves",
    handle: "@marinaalves",
    text: "Fechei duas parcerias em um único evento. O LeadEvent trouxe as marcas até mim.",
  },
  {
    avatarSrc:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&h=96&q=80",
    name: "Rafael Nunes",
    handle: "@rafanunes",
    text: "Como empresa, encontrar criadores alinhados à nossa marca nunca foi tão rápido.",
  },
  {
    avatarSrc:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&h=96&q=80",
    name: "Camila Rocha",
    handle: "@camirocha",
    text: "A triagem de perfis economiza horas. Chegamos direto nas conversas que importam.",
  },
];

export default function Home() {
  return (
    <SignInPage
      testimonials={sampleTestimonials}
      videoSrc="/media/leadevent-hero.mp4"
      videoPosterSrc="/media/leadevent-hero-poster.jpg"
    />
  );
}
