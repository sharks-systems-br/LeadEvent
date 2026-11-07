export const brand = {
  company: {
    name: "Sharks Systems Brazil",
    shortName: "SSB",
    cnpj: "01.634.705/0001-23",
    address: "Centro, Maruim/SE — CEP 49770-000",
    dpoName: "Alec Vinicius",
    dpoEmail: "alecvinicius.dev@gmail.com",
    contactEmail: "linkpetroleoegas@gmail.com",
    logo: "/brand/ssb-logo.png",
  },
  product: {
    name: "LeadEvent",
  },
  event: {
    name: "Feijoada dos Influenciadores",
    logo: "/brand/feijoada-logo.png",
  },
} as const;

export const companyCredit = `Desenvolvido por ${brand.company.shortName} · ${brand.company.name}`;
