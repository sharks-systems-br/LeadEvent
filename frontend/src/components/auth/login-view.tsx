"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthUI, type SignInValues } from "@/components/ui/auth-ui";
import { login } from "@/lib/api/auth";
import { getLoginErrorMessage } from "@/lib/api/errors";
import { hasValidAccessToken } from "@/lib/auth";

export function LoginView() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasValidAccessToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  async function handleSignIn(values: SignInValues) {
    setLoading(true);
    setError(null);

    try {
      await login(values.username, values.password);
      router.replace("/dashboard");
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return <AuthUI error={error} loading={loading} onSignIn={handleSignIn} />;
}
