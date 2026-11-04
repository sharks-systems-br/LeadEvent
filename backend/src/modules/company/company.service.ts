import { ConflictException, Injectable } from "@nestjs/common";
import { CreateCompanyDto } from "./dto/create-company.dto.js";
import { UpdateCompanyDto } from "./dto/update-company.dto.js";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Company } from "./entities/company.entity.js";
import { InjectRepository } from "@mikro-orm/nestjs";

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

    async create(dto: CreateCompanyDto): Promise<void> {
        const { confirmContact: _, partnershipFormats, ...rest } = dto;

        await this.assertCnpjIsAvailable(rest.cnpj);

        this.companyRepository.create(
            { ...rest, partnershipFormats: partnershipFormats.map(f => ({ format: f })) },
            { partial: true },
        );
        await this.em.flush();
    }

    findAll() {
        return `This action returns all company`;
    }

    findOne(id: number) {
        return `This action returns a #${id} company`;
    }

    update(id: number, _dto: UpdateCompanyDto) {
        return `This action updates a #${id} company`;
    }

    remove(id: number) {
        return `This action removes a #${id} company`;
    }
}
