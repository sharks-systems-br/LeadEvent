import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
    OnModuleInit,
    UnauthorizedException,
} from "@nestjs/common";
import authConfig from "./configs/auth.config.js";
import type { ConfigType } from "@nestjs/config";
import { HashingService } from "./hashing/hashing.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { LoginResponseDto } from "./dto/login-response.dto.js";
import { JwtService, TokenExpiredError } from "@nestjs/jwt";
import { TokenPayload } from "../../common/interfaces/token-payload.interface.js";
import { randomBytes, timingSafeEqual } from "crypto";
import { AdminData } from "./interfaces/admin-data.interface.js";
import { RefreshDto } from "./dto/refresh.dto.js";
import { TokenExpiredException } from "../../common/exceptions/token-expired.exception.js";
import { TokenInvalidException } from "../../common/exceptions/token-invalid.exception.js";
import { ChangePasswordDto } from "./dto/change-password.dto.js";
import { ForceChangePasswordDto } from "./dto/force-change-password.dto.js";

@Injectable()
export class AuthService implements OnModuleInit {
    private adminUsers: ReadonlyMap<string, AdminData>;
    private dummyHash: string;

    constructor(
        @Inject(authConfig.KEY) private readonly config: ConfigType<typeof authConfig>,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
    ) {}

    async onModuleInit() {
        const usersMapped = this.config.adminUsersString.split("|").filter(Boolean);
        if (!usersMapped.length) throw new Error("Nenhum usuário ADMIN foi configurado nas variáveis de ambiente");

        this.adminUsers = new Map(
            await Promise.all(
                usersMapped.map(async u => {
                    const [username, password] = u.split(":");
                    const hash = await this.hashingService.hash(password);
                    return [
                        username,
                        { username: username, passwordHash: hash, changedPassword: false, tokenVersion: 1 },
                    ] satisfies [string, AdminData];
                }),
            ),
        );

        this.dummyHash = await this.hashingService.hash(randomBytes(16).toString("hex"));
    }

    private async generateAuthTokens(username: string, tokenVersion: number): Promise<LoginResponseDto> {
        return {
            accessToken: await this.jwtService.signAsync<TokenPayload>({ sub: username, type: "access", tokenVersion }),
            refreshToken: await this.jwtService.signAsync<TokenPayload>(
                { sub: username, type: "refresh", tokenVersion },
                { expiresIn: "1day" },
            ),
        };
    }

    private throwInvalidCredentials(): never {
        throw new UnauthorizedException("Credenciais inválidas.");
    }

    async login(dto: LoginDto): Promise<LoginResponseDto> {
        const admin = this.adminUsers.get(dto.username);
        const correct = await this.hashingService.compare(dto.password, admin?.passwordHash ?? this.dummyHash);

        if (!admin || !correct) this.throwInvalidCredentials();

        return this.generateAuthTokens(admin.username, admin.tokenVersion);
    }

    checkTokenVersion(payload: TokenPayload): boolean {
        return payload.tokenVersion === this.adminUsers.get(payload.sub)?.tokenVersion;
    }

    async refresh(dto: RefreshDto): Promise<LoginResponseDto> {
        let payload: TokenPayload;

        try {
            payload = await this.jwtService.verifyAsync<TokenPayload>(dto.refreshToken);

            if (payload.type !== "refresh" || !this.checkTokenVersion(payload)) throw new Error();
        } catch (err) {
            if (err instanceof TokenExpiredError) throw new TokenExpiredException();

            throw new TokenInvalidException();
        }

        return this.generateAuthTokens(payload.sub, payload.tokenVersion);
    }

    async changePassword(tokenPayload: TokenPayload, dto: ChangePasswordDto): Promise<void> {
        const admin = this.adminUsers.get(tokenPayload.sub);

        if (!admin) {
            throw new NotFoundException(
                "Não foi possível localizar o seu usuário, por favor entre em contato com o suporte o quanto antes.",
            );
        }

        // Falha rápido
        if (admin.changedPassword) {
            throw new ConflictException("Você já trocou sua senha uma vez.");
        }

        const correct = await this.hashingService.compare(dto.oldPassword, admin.passwordHash);
        if (!correct) this.throwInvalidCredentials();

        if (dto.oldPassword === dto.newPassword) {
            throw new BadRequestException("Sua nova senha não pode ser igual a anterior.");
        }

        const newPasswordHash = await this.hashingService.hash(dto.newPassword);

        // Previne contra race condition
        if (admin.changedPassword) {
            throw new ConflictException("Você já trocou sua senha uma vez.");
        }

        // Modifica a referência do objeto
        admin.passwordHash = newPasswordHash;
        admin.changedPassword = true;
        admin.tokenVersion++;
    }

    // Método que só os desenvolvedores tem acesso em caso de emergencia se uma senha vazar
    async forceChangePassord(dto: ForceChangePasswordDto): Promise<void> {
        const receivedBuffer = Buffer.from(dto.token);
        const secretBuffer = Buffer.from(this.config.emergencyToken);

        if (receivedBuffer.length !== secretBuffer.length) {
            return this.throwInvalidCredentials();
        }

        const correct = timingSafeEqual(receivedBuffer, secretBuffer);
        if (!correct) this.throwInvalidCredentials();

        const admin = this.adminUsers.get(dto.username);
        if (!admin) this.throwInvalidCredentials();

        admin.passwordHash = await this.hashingService.hash(dto.newPassword);
        admin.tokenVersion++;
    }
}
