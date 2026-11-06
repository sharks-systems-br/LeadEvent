import axios from "axios";

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return "Não foi possível enviar. Tente novamente.";
  }

  if (!error.response) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  }

  const { status, data } = error.response;

  if (status === 409) {
    return typeof data?.message === "string"
      ? data.message
      : "Este cadastro já existe.";
  }

  if (status === 400) {
    return typeof data?.message === "string"
      ? data.message
      : "Não foi possível validar a verificação de segurança.";
  }

  if (status === 422) {
    return "Alguns dados não passaram na validação. Revise o formulário e tente novamente.";
  }

  if (status === 429) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
  }

  if (status >= 500) {
    return "O servidor não conseguiu concluir o envio. Tente novamente em instantes.";
  }

  return "Não foi possível enviar. Tente novamente.";
}
