import { Migration } from '@mikro-orm/migrations';

export class Migration20261102200039 extends Migration {

  override name = 'Migration20261102200039';

  override up(): void | Promise<void> {
    this.addSql(`create table "company" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "trade_name" varchar(150) not null, "cnpj" varchar(14) not null, "contact_email" varchar(255) not null, "person_name" varchar(150) not null, "social_media" varchar(255) not null, "reason" varchar(700) not null, primary key ("id"));`);
    this.addSql(`alter table "company" add constraint "company_cnpj_unique" unique ("cnpj");`);

    this.addSql(`create table "partnership_format" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "format" varchar(30) not null, "company_id" uuid not null, primary key ("id"));`);

    this.addSql(`alter table "partnership_format" add constraint "partnership_format_company_id_foreign" foreign key ("company_id") references "company" ("id") on delete cascade;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "partnership_format" drop constraint "partnership_format_company_id_foreign";`);

    this.addSql(`drop table if exists "company" cascade;`);
    this.addSql(`drop table if exists "partnership_format" cascade;`);
  }

}
