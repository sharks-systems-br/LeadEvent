import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateCompanyDto } from "./dto/create-company.dto.js";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Company } from "./entities/company.entity.js";
import { InjectRepository } from "@mikro-orm/nestjs";
import { UpdateApprovalStatusDto } from "../../common/dto/update-approval-status.dto.js";
import { SearchCompanyQueryDto } from "./dto/search-company-query.dto.js";
import { CountsResponseDto } from "../../common/dto/counts-response.dto.js";

@Injectable()
export class CompanyService {
    constructor(
        private readonly em: EntityManager,
        @InjectRepository(Company) private readonly companyRepository: EntityRepository<Company>,
    ) {}

    private async assertCnpjIsAvailable(cnpj: string): Promise<void> {
        const exists = await this.companyRepository.findOne({ cnpj }, { fields: ["id"] });
        if (exists) throw new ConflictException("Já existe uma empresa com esse CNPJ.");
    }

    private assertExists<T>(entity: T): asserts entity is NonNullable<T> {
        if (!entity) throw new NotFoundException("Empresa não encontrada.");
    }

    async create(dto: CreateCompanyDto): Promise<void> {
        const { confirmContact: _, partnershipFormats, ...rest } = dto;

        await this.assertCnpjIsAvailable(rest.cnpj);

        this.companyRepository.create(
            { ...rest, partnershipFormats: partnershipFormats.map(f => ({ format: f })) },
            { partial: true },
        );
        await this.em.flush();
    }

    async getCounts(): Promise<CountsResponseDto> {
        const counts = await this.companyRepository.countBy("approvalStatus");
        counts["APPROVED"] ??= 0;
        counts["PENDING"] ??= 0;
        counts["REFUSED"] ??= 0;

        return {
            APPROVED: counts["APPROVED"],
            PENDING: counts["PENDING"],
            REFUSED: counts["REFUSED"],
            total: counts["APPROVED"] + counts["PENDING"] + counts["REFUSED"],
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

    async recover(id: string): Promise<void> {
        const company = await this.companyRepository.findOne({ id, deletedAt: { $ne: null } });
        this.assertExists(company);

        company.deletedAt = null;

        await this.em.flush();
    }

    async updateStatus(id: string, dto: UpdateApprovalStatusDto): Promise<Company> {
        const company = await this.companyRepository.findOne(
            { id, deletedAt: null },
            { populate: ["partnershipFormats"] },
        );
        this.assertExists(company);

        company.approvalStatus = dto.approvalStatus;

        await this.em.flush();

        return company;
    }

    async remove(id: string): Promise<void> {
        const company = await this.companyRepository.findOne({ id, deletedAt: null });
        this.assertExists(company);

        company.deletedAt = new Date();

        await this.em.flush();
    }
}
