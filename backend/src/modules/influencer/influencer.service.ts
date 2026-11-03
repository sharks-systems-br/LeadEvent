import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { CreateInfluencerDto } from "./dto/create-influencer.dto.js";
import { UpdateInfluencerDto } from "./dto/update-influencer.dto.js";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Influencer } from "./entities/influencer.entity.js";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { StorageService } from "../../infra/storage/storage.service.js";
import { FilesService } from "../files/files.service.js";

@Injectable()
export class InfluencerService {
    constructor(
        @InjectRepository(Influencer)
        private readonly influencerRepository: EntityRepository<Influencer>,
        private readonly em: EntityManager,
        private readonly storageService: StorageService,
        private readonly filesService: FilesService,
    ) {}

    private async assertInstagramIsAvailable(instagram: string): Promise<void> {
        const exists = await this.influencerRepository.findOne({ instagram }, { fields: ["id"] });
        if (exists) throw new ConflictException("Já existe um influencer com esse instagram.");
    }

    async create(dto: CreateInfluencerDto): Promise<void> {
        const { filePath, fileUrl, confirmContact: _, socialMedias, ...rest } = dto;

        // if (!confirmContact) {
        //     throw new BadRequestException(
        //         "Para confirmar seu cadastro, você deve nos autorizar a entrar em contato com você.",
        //     );
        // }

        console.log(rest);

        if (filePath) {
            await this.filesService.verifyFilePath(filePath);
        } else if (!fileUrl) {
            throw new BadRequestException("O video precisa ser fornecido.");
        }

        await this.assertInstagramIsAvailable(dto.instagram);

        let videoId: string | undefined;
        let videoUrl = fileUrl;
        if (filePath && !fileUrl) {
            const { id } = await this.storageService.upload(filePath);

            await this.filesService.removeFile(filePath);

            videoId = id;
            videoUrl = await this.storageService.getPublicUrl(videoId);
        }

        this.influencerRepository.create(
            {
                ...rest,
                videoId,
                videoUrl,
                socialMedias: socialMedias?.map(sm => ({ ...sm })),
            },
            { partial: true },
        );
        await this.em.flush();
    }

    findAll() {
        return `This action returns all influencer`;
    }

    findOne(id: number) {
        return `This action returns a #${id} influencer`;
    }

    update(id: number, updateInfluencerDto: UpdateInfluencerDto) {
        return `This action updates a #${id} influencer`;
    }

    remove(id: number) {
        return `This action removes a #${id} influencer`;
    }
}
