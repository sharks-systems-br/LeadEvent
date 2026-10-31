import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { SaveFileResponseDto } from "./dto/save-file-response.dto.js";
import { unlink, access } from "node:fs/promises";

@Injectable()
export class FilesService {
    private readonly logger = new Logger(FilesService.name);

    async removeFile(path: string): Promise<void> {
        try {
            await unlink(path);
            this.logger.log(`Removido: ${path}`);
        } catch (err: any) {
            this.logger.warn(`Falha ao remover ${path}: ${err}`);
        }
    }

    async verifyFilePath(path: string): Promise<void> {
        if (!/^tmp\\[a-f0-9]{32}$/.test(path)) {
            throw new BadRequestException("Caminho de arquivo inválido.");
        }

        await access(path).catch(() => {
            throw new BadRequestException("Arquivo não encontrado.");
        });
    }

    async saveFile(file: Express.Multer.File): Promise<SaveFileResponseDto> {
        setTimeout(async () => this.removeFile(file.path), 10 * 60 * 1000);

        return { filePath: file.path };
    }
}
