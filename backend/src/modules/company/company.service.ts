import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateCompanyDto } from "./dto/create-company.dto.js";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Company } from "./entities/company.entity.js";
import { InjectRepository } from "@mikro-orm/nestjs";
import { UpdateApprovalStatusDto } from "../../common/dto/update-approval-status.dto.js";
import { ApprovalStatus } from "../../common/enums/approval-status.enum.js";
import { SearchCompanyQueryDto } from "./dto/search-company-query.dto.js";
import { CountsResponseDto } from "../../common/dto/counts-response.dto.js";
import { PRIVACY_POLICY_VERSION } from "../../common/constants/privacy.constants.js";
import { AuditService } from "../audit/audit.service.js";

@Injectable()
export class CompanyService {
    constructor(
        private readonly em: EntityManager,
        @InjectRepository(Company) private readonly companyRepository: EntityRepository<Company>,
        private readonly auditService: AuditService,
    ) {}

    private async assertCnpjIsAvailable(cnpj: string): Promise<void> {
        const exists = await this.companyRepository.findOne({ cnpj }, { fields: ["id"] });
        if (exists) throw new ConflictException("Já existe uma empresa com esse CNPJ.");
    }

    private assertExists<T>(entity: T): asserts entity is NonNullable<T> {
        if (!entity) throw new NotFoundException("Empresa não encontrada.");
    }

    async create(dto: CreateCompanyDto, consentIp: string | null): Promise<void> {
        const { confirmContact: _, partnershipFormats, ...rest } = dto;

        await this.assertCnpjIsAvailable(rest.cnpj);

        this.companyRepository.create(
            {
                ...rest,
                partnershipFormats: partnershipFormats.map(f => ({ format: f })),
                consentAt: new Date(),
                consentVersion: PRIVACY_POLICY_VERSION,
                consentIp,
            },
            { partial: true },
        );
        await this.em.flush();
    }

    async getCounts(): Promise<CountsResponseDto> {
        const [pending, approved, refused] = await Promise.all([
            this.companyRepository.count({ deletedAt: null, approvalStatus: ApprovalStatus.PENDING }),
            this.companyRepository.count({ deletedAt: null, approvalStatus: ApprovalStatus.APPROVED }),
            this.companyRepository.count({ deletedAt: null, approvalStatus: ApprovalStatus.REFUSED }),
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
        disponibility,
        partnershipFormat,
        text,
    }: SearchCompanyQueryDto): Promise<Company[]> {
        const ilikeText = text && "%" + text + "%";

        const companies = await this.companyRepository.find(
            {
                deletedAt: null,
                disponibility,
                approvalStatus,
                partnershipFormats: {
                    $some: {
                        format: partnershipFormat,
                    },
                },
                ...(ilikeText && {
                    $or: [
                        { cnpj: { $ilike: ilikeText } },
                        { tradeName: { $ilike: ilikeText } },
                        { contactEmail: { $ilike: ilikeText } },
                        { personName: { $ilike: ilikeText } },
                    ],
                }),
            },
            {
                limit: perPage,
                offset: (page - 1) * perPage,
                populate: ["partnershipFormats"],
                orderBy: { createdAt: "desc", id: "asc" },
            },
        );

        return companies;
    }

    async findOne(id: string): Promise<Company> {
        const company = await this.companyRepository.findOne(
            { id, deletedAt: null },
            { populate: ["partnershipFormats"] },
        );
        this.assertExists(company);

        return company;
    }

    async recover(id: string, actor: string): Promise<void> {
        const company = await this.companyRepository.findOne({ id, deletedAt: { $ne: null } });
        this.assertExists(company);

        company.deletedAt = null;

        await this.em.flush();

        await this.auditService.record({
            actor,
            action: "COMPANY_RECOVERED",
            entityType: "company",
            entityId: company.id,
        });
    }

    async updateStatus(id: string, dto: UpdateApprovalStatusDto, actor: string): Promise<Company> {
        const company = await this.companyRepository.findOne(
            { id, deletedAt: null },
            { populate: ["partnershipFormats"] },
        );
        this.assertExists(company);

        const previousStatus = company.approvalStatus;
        company.approvalStatus = dto.approvalStatus;

        await this.em.flush();

        await this.auditService.record({
            actor,
            action: "COMPANY_STATUS_UPDATED",
            entityType: "company",
            entityId: company.id,
            metadata: { previousStatus, approvalStatus: dto.approvalStatus },
        });

        return company;
    }

    async remove(id: string, actor: string): Promise<void> {
        const company = await this.companyRepository.findOne({ id, deletedAt: null });
        this.assertExists(company);

        company.deletedAt = new Date();

        await this.em.flush();

        await this.auditService.record({
            actor,
            action: "COMPANY_DELETED",
            entityType: "company",
            entityId: company.id,
        });
    }
}
