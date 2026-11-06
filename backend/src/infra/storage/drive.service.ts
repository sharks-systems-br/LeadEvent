import { Inject, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { google, drive_v3 } from "googleapis";
import { StorageService } from "./storage.service.js";
import driveConfig from "./config/drive.config.js";
import { createReadStream } from "node:fs";
import { extname } from "node:path";
import { fileTypeFromFile } from "file-type";
import axios, { isAxiosError } from "axios";
import appConfig from "../../config/app.config.js";

@Injectable()
export class DriveService extends StorageService {
    private readonly drive: drive_v3.Drive;
    private readonly folderId: string;
    private readonly logger = new Logger(DriveService.name);
    private readonly countsToSendAlert: ReadonlySet<number> = new Set([20, 30, 40, 50]);

    constructor(
        @Inject(driveConfig.KEY) driveConfiguration: ConfigType<typeof driveConfig>,
        @Inject(appConfig.KEY) private readonly appConfiguration: ConfigType<typeof appConfig>,
    ) {
        super();

        const auth = new google.auth.OAuth2(
            driveConfiguration.clientId,
            driveConfiguration.clientSecret,
            "https://developers.google.com/oauthplayground",
        );
        auth.setCredentials({
            refresh_token: driveConfiguration.refreshToken,
        });

        this.drive = google.drive({ version: "v3", auth });
        this.folderId = driveConfiguration.folderId;
    }

    private async sendAlertToDiscord(currentCount: number, hour: number): Promise<void> {
        try {
            await axios.post(this.appConfiguration.discord.webhookUrl, {
                content: `<@&${this.appConfiguration.discord.roleId}>`,
                allowed_mentions: {
                    roles: [this.appConfiguration.discord.roleId],
                },
                embeds: [
                    {
                        title: `WARNING [LeadEvent]: Quantidade relevante de vídeos subidos para o Drive`,
                        description: `${currentCount} vídeos foram subidos para o Drive nesta hora: ${hour}.`,
                        color: 0xffa500,
                        footer: {
                            text: `LeadEvent - ${this.appConfiguration.enviroment}`,
                        },
                        timestamp: new Date().toISOString(),
                    },
                ],
            });
        } catch (error) {
            if (isAxiosError(error)) {
                this.logger.error(
                    "Falha ao comunicar com o Discord. Resposta do servidor:",
                    error.response?.data ?? error.message,
                );
            } else {
                this.logger.error("Erro inesperado ao comunicar o Discord:", error);
            }
        }
    }

    private uploadLimit = { hour: new Date().getHours(), count: 0 };

    private checkUploadLimit() {
        const currentHour = new Date().getHours();

        if (currentHour !== this.uploadLimit.hour) {
            this.uploadLimit = { hour: currentHour, count: 0 };
        }

        if (this.uploadLimit.count >= 50) {
            throw new InternalServerErrorException(
                "Não foi possível realizar o upload do seu arquivo, tente novamente mais tarde.",
            );
        }

        this.uploadLimit.count++;

        if (this.countsToSendAlert.has(this.uploadLimit.count)) {
            void this.sendAlertToDiscord(this.uploadLimit.count, this.uploadLimit.hour);
        }
    }

    async upload(path: string): Promise<{ id: string }> {
        this.checkUploadLimit();

        try {
            const type = await fileTypeFromFile(path);

            const { data } = await this.drive.files.create({
                requestBody: {
                    name: `${crypto.randomUUID()}${type ? `.${type.ext}` : extname(path)}`,
                    parents: [this.folderId],
                },
                media: {
                    mimeType: type?.mime ?? "application/octet-stream",
                    body: createReadStream(path),
                },
                fields: "id",
            });

            await this.drive.permissions.create({
                fileId: data.id!,
                requestBody: { role: "reader", type: "anyone" },
            });

            return { id: data.id! };
        } catch (err) {
            this.logger.error("Falha ao fazer upload do arquivo para o Drive:", err);
            throw new InternalServerErrorException("Falha ao armazer arquivo.");
        }
    }

    async delete(id: string): Promise<void> {
        await this.drive.files.delete({ fileId: id });
    }

    getPublicUrl(id: string): string {
        return `https://drive.google.com/file/d/${id}/preview`;
    }
}
