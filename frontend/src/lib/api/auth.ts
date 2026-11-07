import { saveTokens, type AuthTokens } from "@/lib/auth";
import { api } from "./client";

export async function login(
  username: string,
  password: string,
): Promise<AuthTokens> {
  const { data } = await api.post<AuthTokens>("/auth/login", {
    username,
    password,
  });

  saveTokens(data);
  return data;
}
