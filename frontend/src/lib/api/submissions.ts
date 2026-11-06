import { api } from "./client";
import {
  buildCompanyPayload,
  buildInfluencerPayload,
  type CompanyFormValues,
  type InfluencerFormValues,
} from "./mappers";

function turnstileHeaders(token: string | null) {
  return token ? { "cf-turnstile-response": token } : undefined;
}

async function uploadVideo(file: File): Promise<string> {
  const data = new FormData();
  data.append("file", file);

  const response = await api.post<{ filePath: string }>("/files", data, {
    timeout: 0,
  });

  return response.data.filePath;
}

export async function submitInfluencer(
  values: InfluencerFormValues,
  video: File | null,
  turnstileToken: string | null
): Promise<void> {
  const filePath = video ? await uploadVideo(video) : undefined;

  await api.post("/influencers", buildInfluencerPayload(values, filePath), {
    headers: turnstileHeaders(turnstileToken),
  });
}

export async function submitCompany(
  values: CompanyFormValues,
  turnstileToken: string | null
): Promise<void> {
  await api.post("/companies", buildCompanyPayload(values), {
    headers: turnstileHeaders(turnstileToken),
  });
}
