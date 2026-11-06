import openapi from "../contracts/openapi.json";

type ContractSchema = {
  $ref?: string;
  allOf?: ContractSchema[];
  type?: string;
  enum?: string[];
  pattern?: string;
  required?: string[];
  properties?: Record<string, ContractSchema>;
  items?: ContractSchema;
  examples?: unknown[];
};

type Contract = {
  components: { schemas: Record<string, ContractSchema> };
};

const contract = openapi as unknown as Contract;

function resolve(schema: ContractSchema): ContractSchema {
  if (schema.$ref) {
    const name = schema.$ref.split("/").pop() ?? "";
    return contract.components.schemas[name] ?? schema;
  }

  if (schema.allOf?.length === 1) {
    return resolve(schema.allOf[0]);
  }

  return schema;
}

function typeOf(value: unknown): string {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

const errors: string[] = [];

function validate(value: unknown, schema: ContractSchema, path: string) {
  const target = resolve(schema);

  if (target.enum && !target.enum.includes(String(value))) {
    errors.push(`${path}: valor "${String(value)}" fora do enum`);
  }

  if (target.type && typeOf(value) !== target.type) {
    errors.push(`${path}: esperado ${target.type}, recebido ${typeOf(value)}`);
    return;
  }

  if (target.type === "string" && typeof value === "string" && target.pattern) {
    if (!new RegExp(target.pattern).test(value)) {
      errors.push(`${path}: valor "${value}" não corresponde ao padrão`);
    }
  }

  if (target.type === "array" && target.items && Array.isArray(value)) {
    value.forEach((item, index) =>
      validate(item, target.items as ContractSchema, `${path}[${index}]`)
    );
  }

  if (target.type === "object" && target.properties && value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    for (const key of target.required ?? []) {
      if (!(key in record)) {
        errors.push(`${path}.${key}: campo obrigatório ausente`);
      }
    }

    for (const [key, property] of Object.entries(target.properties)) {
      if (key in record) {
        validate(record[key], property, `${path}.${key}`);
      }
    }

    for (const key of Object.keys(record)) {
      if (!(key in target.properties)) {
        errors.push(`${path}.${key}: campo não previsto no contrato`);
      }
    }
  }
}

let checked = 0;

for (const [name, schema] of Object.entries(contract.components.schemas)) {
  for (const [index, example] of (schema.examples ?? []).entries()) {
    validate(example, schema, `${name}[${index}]`);
    checked += 1;
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Contrato válido: ${checked} exemplos verificados.`);
