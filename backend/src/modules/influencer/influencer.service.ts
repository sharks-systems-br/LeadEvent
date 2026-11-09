import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateInfluencerDto } from "./dto/create-influencer.dto.js";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Influencer } from "./entities/influencer.entity.js";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { StorageService } from "../../infra/storage/storage.service.js";
import { FilesService } from "../files/files.service.js";
import { CountsResponseDto } from "../../common/dto/counts-response.dto.js";
import { SearchInfluencerQueryDto } from "./dto/search-influencer-query.dto.js";
import { UpdateApprovalStatusDto } from "../../common/dto/update-approval-status.dto.js";
import { ApprovalStatus } from "../../common/enums/approval-status.enum.js";
import { PRIVACY_POLICY_VERSION } from "../../common/constants/privacy.constants.js";
import { AuditService } from "../audit/audit.service.js";

@Injectable()
export class InfluencerService {
    constructor(
        @InjectRepository(Influencer)
        private readonly influencerRepository: EntityRepository<Influencer>,
        private readonly em: EntityManager,
        private readonly storageService: StorageService,
        private readonly filesService: FilesService,
        private readonly auditService: AuditService,
    ) {}

    private async assertInstagramIsAvailable(instagram: string): Promise<void> {
        const exists = await this.influencerRepository.findOne({ instagram }, { fields: ["id"] });
        if (exists) throw new ConflictException("Já existe um influencer com esse instagram.");
    }

    private assertExists<T>(entity: T): asserts entity is NonNullable<T> {
        if (!entity) throw new NotFoundException("Influencer não encontrado.");
    }

    async create(dto: CreateInfluencerDto, consentIp: string | null): Promise<void> {
        const { filePath, fileUrl, confirmContact: _, socialMedias, ...rest } = dto;

        if (filePath) {
            await this.filesService.verifyFilePath(filePath);
        }

        await this.assertInstagramIsAvailable(dto.instagram);

        let videoId: string | undefined;
        let videoUrl = fileUrl ?? "";
        if (filePath && !fileUrl) {
            const { id } = await this.storageService.upload(filePath);

            await this.filesService.removeFile(filePath);

            videoId = id;
            videoUrl = await this.storageService.getPublicUrl(videoId);
        }

        try {
            this.influencerRepository.create(
                {
                    ...rest,
                    videoId,
                    videoUrl,
                    socialMedias: socialMedias?.map(sm => ({ ...sm })),
                    consentAt: new Date(),
                    consentVersion: PRIVACY_POLICY_VERSION,
                    consentIp,
                },
                { partial: true },
            );
            await this.em.flush();
        } catch (err) {
            if (videoId) await this.storageService.delete(videoId);

            throw err;
        }
    }

    async getCounts(): Promise<CountsResponseDto> {
        const [pending, approved, refused] = await Promise.all([
            this.influencerRepository.count({ deletedAt: null, approvalStatus: ApprovalStatus.PENDING }),
            this.influencerRepository.count({ deletedAt: null, approvalStatus: ApprovalStatus.APPROVED }),
            this.influencerRepository.count({ deletedAt: null, approvalStatus: ApprovalStatus.REFUSED }),
        ]);

        return {
            PENDING: pending,
            APPROVED: approved,
            REFUSED: refused,
            total: pending + approved + refused,
        };
    }

    async findAll({
        page,
        perPage,
        approvalStatus,
        followerRange,
        niche,
        state,
        text,
    }: SearchInfluencerQueryDto): Promise<Influencer[]> {
        const ilikeText = text && "%" + text + "%";

        const influencers = await this.influencerRepository.find(
            {
                deletedAt: null,
                approvalStatus,
                followerRange,
                niche,
                state,
                ...(ilikeText && {
                    $or: [
                        { name: { $ilike: ilikeText } },
                        { city: { $ilike: ilikeText } },
                        { instagram: { $ilike: ilikeText } },
                    ],
                }),
            },
            {
                limit: perPage,
                offset: (page - 1) * perPage,
                populate: ["socialMedias"],
                orderBy: { createdAt: "desc", id: "asc" },
            },
        );

        return influencers;
    }

    async findOne(id: string): Promise<Influencer> {
        const influencer = await this.influencerRepository.findOne(
            { id, deletedAt: null },
            { populate: ["socialMedias"] },
        );
        this.assertExists(influencer);

        return influencer;
    }

    async recover(id: string, actor: string): Promise<void> {
        const influencer = await this.influencerRepository.findOne({ id, deletedAt: { $ne: null } });
        this.assertExists(influencer);

        influencer.deletedAt = null;

        await this.em.flush();

        await this.auditService.record({
            actor,
            action: "INFLUENCER_RECOVERED",
            entityType: "influencer",
            entityId: influencer.id,
        });
    }

    async updateStatus(id: string, dto: UpdateApprovalStatusDto, actor: string): Promise<Influencer> {
        const influencer = await this.influencerRepository.findOne(
            { id, deletedAt: null },
            { populate: ["socialMedias"] },
        );
        this.assertExists(influencer);

        const previousStatus = influencer.approvalStatus;
        influencer.approvalStatus = dto.approvalStatus;

        await this.em.flush();

        await this.auditService.record({
            actor,
            action: "INFLUENCER_STATUS_UPDATED",
            entityType: "influencer",
            entityId: influencer.id,
            metadata: { previousStatus, approvalStatus: dto.approvalStatus },
        });

        return influencer;
    }

    async remove(id: string, actor: string): Promise<void> {
        const influencer = await this.influencerRepository.findOne({ id, deletedAt: null });
        this.assertExists(influencer);

        influencer.deletedAt = new Date();

        await this.em.flush();

        await this.auditService.record({
            actor,
            action: "INFLUENCER_DELETED",
            entityType: "influencer",
            entityId: influencer.id,
        });
    }
}
