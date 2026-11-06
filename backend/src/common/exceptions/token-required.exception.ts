import { HttpStatus, UnauthorizedException } from "@nestjs/common";
import { STATUS_CODES } from "http";

export class TokenRequiredException extends UnauthorizedException {
    constructor(message?: string) {
        super({
            error: STATUS_CODES[HttpStatus.UNAUTHORIZED],
            message: message ?? "Token ausente.",
            statusCode: HttpStatus.UNAUTHORIZED,
            code: "TOKEN_REQUIRED",
        });
    }
}
