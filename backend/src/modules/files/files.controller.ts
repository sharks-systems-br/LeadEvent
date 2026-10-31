import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FilesService } from "./files.service.js";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { SaveFileResponseDto } from "./dto/save-file-response.dto.js";
import { VideoFilePipe } from "../../common/pipes/video-file.pipe.js";
import { minutes, seconds, Throttle } from "@nestjs/throttler";

@Controller("files")
export class FilesController {
    constructor(private readonly filesService: FilesService) {}

    @Post()
    @Throttle({
        short: { limit: 1, ttl: seconds(1) },
        long: { limit: 15, ttl: minutes(5) },
    })
    @UseInterceptors(
        FileInterceptor("file", {
            storage: diskStorage({ destination: "./tmp" }),
            limits: { fileSize: 30 * 1024 * 1024 },
            fileFilter: (_req, file, cb) => {
                const ok = /^video\/(mp4|webm|mov)$/.test(file.mimetype);
                cb(ok ? null : new BadRequestException("Formato de arquivo não suportado."), ok);
            },
        }),
    )
    upload(@UploadedFile(VideoFilePipe) file: Express.Multer.File): Promise<SaveFileResponseDto> {
        return this.filesService.saveFile(file);
    }
}
