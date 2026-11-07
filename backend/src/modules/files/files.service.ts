import { BadRequestException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { SaveFileResponseDto } from "./dto/save-file-response.dto.js";
import { access, readdir, stat, unlink } from "node:fs/promises";
import { join } from "node:path";

const TMP_DIRECTORY = "tmp";
const MAX_FILE_AGE_MS = 24 * 60 * 60 * 1000;
const SWEEP_INTERVAL_MS = 60 * 60 * 1000;

@Injectable()
export class FilesService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(FilesService.name);
    private sweepTimer: NodeJS.Timeout | null = null;

    onModuleInit(): void {
        void this.sweepTmp();
        this.sweepTimer = setInterval(() => void this.sweepTmp(), SWEEP_INTERVAL_MS);
        this.sweepTimer.unref();
    }

    onModuleDestroy(): void {
        if (this.sweepTimer) clearInterval(this.sweepTimer);
    }

    async sweepTmp(): Promise<void> {
        let entries: string[];

        try {
            entries = await readdir(TMP_DIRECTORY);
        } catch {
            return;
        }

        const now = Date.now();

        await Promise.all(
            entries.map(async name => {
                const path = join(TMP_DIRECTORY, name);

                try {
                    const info = await stat(path);

                    if (info.isFile() && now - info.mtimeMs > MAX_FILE_AGE_MS) {
                        await unlink(path);
                    }
                } catch {
                    return;
                }
            }),
        );
    }

    async removeFile(path: string): Promise<void> {
        try {
            await unlink(path);
        } catch (err: any) {
            this.logger.warn(`Falha ao remover ${path}:`, err);
        }
    }

    async verifyFilePath(path: string): Promise<void> {
        if (!/^tmp[\\/][a-f0-9]{32}$/.test(path)) {
            throw new BadRequestException("Caminho de arquivo inválido.");
        }

        await access(path).catch(() => {
            throw new BadRequestException("Arquivo não encontrado.");
        });
    }

    async saveFile(file: Express.Multer.File): Promise<SaveFileResponseDto> {
        return { filePath: file.path };
    }
}
