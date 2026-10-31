import { Inject, Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { google, drive_v3 } from "googleapis";
import { StorageService } from "./storage.service.js";
import driveConfig from "./config/drive.config.js";
import { createReadStream } from "node:fs";
import { extname } from "node:path";
import { fileTypeFromFile } from "file-type";

@Injectable()
export class DriveService extends StorageService {
    private readonly drive: drive_v3.Drive;
    private readonly folderId: string;
    private readonly logger = new Logger(DriveService.name);

    constructor(@Inject(driveConfig.KEY) config: ConfigType<typeof driveConfig>) {
        super();

        const auth = new google.auth.OAuth2(
            config.clientId,
            config.clientSecret,
            "https://developers.google.com/oauthplayground",
        );
        auth.setCredentials({
            refresh_token: config.refreshToken,
        });

        this.drive = google.drive({ version: "v3", auth });
        this.folderId = config.folderId;
    }

    async upload(path: string): Promise<{ id: string }> {
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
                fields: "id, name, webViewLink",
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

    getPublicUrl(id: string): string {
        return `https://drive.google.com/file/d/${id}/preview`;
    }
}
