"use client";

import { useRouter } from "next/navigation";
import { AuthUI } from "@/components/ui/auth-ui";

export function LoginView() {
  const router = useRouter();

  return <AuthUI onSignIn={() => router.push("/dashboard")} />;
}
