import openapi from "../../../contracts/openapi.json";
import type { CompanyLead, InfluencerLead } from "./dashboard";

type SchemaWithExamples<T> = { examples: T[] };

const schemas = openapi.components.schemas as unknown as {
  Company: SchemaWithExamples<CompanyLead>;
  Influencer: SchemaWithExamples<InfluencerLead>;
};

export const demoCompanies: CompanyLead[] = schemas.Company.examples;
export const demoInfluencers: InfluencerLead[] = schemas.Influencer.examples;
