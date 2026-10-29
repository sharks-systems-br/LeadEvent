import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PageTransitionProvider } from "@/components/ui/page-transition";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeadEvent",
  description:
    "Conectamos empresas e influenciadores em eventos. Escolha o seu perfil para acessar o LeadEvent.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <PageTransitionProvider>{children}</PageTransitionProvider>
      </body>
    </html>
  );
}
