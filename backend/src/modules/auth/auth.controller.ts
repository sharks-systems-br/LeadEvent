import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { minutes, seconds, Throttle } from "@nestjs/throttler";
import { LoginDto } from "./dto/login.dto.js";
import { LoginResponseDto } from "./dto/login-response.dto.js";
import { RefreshDto } from "./dto/refresh.dto.js";
import { ChangePasswordDto } from "./dto/change-password.dto.js";
import { CurrentTokenPayload } from "../../common/decorators/current-token-payload.decorator.js";
import type { TokenPayload } from "../../common/interfaces/token-payload.interface.js";
import { ForceChangePasswordDto } from "./dto/force-change-password.dto.js";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Throttle({
        short: { limit: 1, ttl: seconds(1) },
        long: { limit: 5, ttl: minutes(15) },
    })
    @Post("login")
    login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
        return this.authService.login(dto);
    }

    @Public()
    @Throttle({
        short: { limit: 1, ttl: seconds(1) },
        long: { limit: 3, ttl: minutes(1) },
    })
    @Post("refresh")
    refresh(@Body() dto: RefreshDto): Promise<LoginResponseDto> {
        return this.authService.refresh(dto);
    }

    @Throttle({
        short: { limit: 1, ttl: seconds(1) },
        long: { limit: 5, ttl: minutes(10) },
    })
    @Post("change-password")
    @HttpCode(HttpStatus.NO_CONTENT)
    changePassword(@CurrentTokenPayload() tokenPayload: TokenPayload, @Body() dto: ChangePasswordDto): Promise<void> {
        return this.authService.changePassword(tokenPayload, dto);
    }

    // Não precisa de rate limit nesse método, a alta entropia do token é a proteção. Adicionar rate limit pode acabar
    // prejudicando em casos de emergencia.
    @Public()
    @Post("force-change-password")
    @HttpCode(HttpStatus.NO_CONTENT)
    forceChangePassord(@Body() dto: ForceChangePasswordDto): Promise<void> {
        return this.authService.forceChangePassord(dto);
    }
}
