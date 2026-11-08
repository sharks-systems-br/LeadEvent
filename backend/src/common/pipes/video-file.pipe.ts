import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { fileTypeFromFile } from "file-type";
import { FilesService } from "../../modules/files/files.service.js";
import { ACCEPTED_VIDEO_MIME_TYPES } from "../constants/video.constants.js";

@Injectable()
export class VideoFilePipe implements PipeTransform<Express.Multer.File> {
    constructor(private readonly filesService: FilesService) {}

    async transform(file: Express.Multer.File) {
        if (!file) throw new BadRequestException("Arquivo obrigatório.");

        const type = await fileTypeFromFile(file.path);
        const mime = type?.mime.toLowerCase();

        if (!type || !mime || !ACCEPTED_VIDEO_MIME_TYPES.has(mime)) {
            await this.filesService.removeFile(file.path);
            throw new BadRequestException(
                "Formato de vídeo não suportado. Envie MP4, MOV, MKV, AVI, WEBM, WMV, FLV, MPEG, TS, 3GP, OGV ou similar.",
            );
        }

        file.mimetype = type.mime;
        return file;
    }
}
