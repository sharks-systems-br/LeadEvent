import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { fileTypeFromFile } from "file-type";
import { FilesService } from "../../modules/files/files.service.js";

const ALLOWED = new Set(["video/mp4", "video/webm", "video/quicktime"]);

@Injectable()
export class VideoFilePipe implements PipeTransform<Express.Multer.File> {
    constructor(private readonly filesService: FilesService) {}

    async transform(file: Express.Multer.File) {
        if (!file) throw new BadRequestException("Arquivo obrigatório");

        const type = await fileTypeFromFile(file.path);

        if (!type || !ALLOWED.has(type.mime)) {
            await this.filesService.removeFile(file.path);
            throw new BadRequestException("O arquivo não é um vídeo válido.");
        }

        file.mimetype = type.mime;
        return file;
    }
}
