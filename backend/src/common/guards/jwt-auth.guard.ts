import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService, TokenExpiredError } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { TokenRequiredException } from "../exceptions/token-required.exception.js";
import { TokenExpiredException } from "../exceptions/token-expired.exception.js";
import { TokenInvalidException } from "../exceptions/token-invalid.exception.js";
import { CustomRequest } from "../interfaces/custom-request.interface.js";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";
import { TokenPayload } from "../interfaces/token-payload.interface.js";
import { AuthService } from "../../modules/auth/auth.service.js";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
        private readonly authService: AuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<CustomRequest>();

        const accessToken = this.extractTokenFromHeader(request);
        if (!accessToken) {
            throw new TokenRequiredException();
        }

        try {
            const payload = await this.jwtService.verifyAsync<TokenPayload>(accessToken);

            if (payload.type !== "access" || !this.authService.checkTokenVersion(payload)) throw new Error();

            request.tokenPayload = payload;
        } catch (err) {
            if (err instanceof TokenExpiredError) throw new TokenExpiredException();

            throw new TokenInvalidException();
        }

        return true;
    }

    private extractTokenFromHeader(request: CustomRequest) {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}
