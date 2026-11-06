import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { TokenPayload } from "../interfaces/token-payload.interface.js";
import type { CustomRequest } from "../interfaces/custom-request.interface.js";

export const CurrentTokenPayload = createParamDecorator((data: keyof TokenPayload, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<CustomRequest>();

    return data ? request.tokenPayload?.[data] : request.tokenPayload;
});
