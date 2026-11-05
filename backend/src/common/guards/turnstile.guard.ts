import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
    ServiceUnavailableException,
} from "@nestjs/common";
import type { Request } from "express";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

@Injectable()
export class TurnstileGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
        if (!secret) return true;

        const request = context.switchToHttp().getRequest<Request>();
        const header = request.headers["cf-turnstile-response"];
        const token = Array.isArray(header) ? header[0] : header;

        if (!token) {
            throw new BadRequestException("Conclua a verificação de segurança para continuar.");
        }

        const body = new URLSearchParams({ secret, response: token });
        if (request.ip) body.set("remoteip", request.ip);

        let response: Response;
        try {
            response = await fetch(SITEVERIFY_URL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body,
                signal: AbortSignal.timeout(5000),
            });
        } catch {
            throw new ServiceUnavailableException(
                "Não foi possível validar a verificação de segurança.",
            );
        }

        const result = (await response.json().catch(() => null)) as { success?: boolean } | null;

        if (!response.ok || !result?.success) {
            throw new BadRequestException("Verificação de segurança inválida.");
        }

        return true;
    }
}
