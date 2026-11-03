import { Migration } from '@mikro-orm/migrations';

export class Migration20261103184929 extends Migration {

  override name = 'Migration20261103184929';

  override up(): void | Promise<void> {
    this.addSql(`create type "SocialMedia" as enum ('INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK', 'LINKEDIN', 'TWITCH', 'PINTEREST', 'THREADS', 'SITE', 'X');`);
    this.addSql(`create table "influencer_social_media" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "social_media" "SocialMedia" not null, "link" varchar(255) not null, "influencer_id" uuid not null, primary key ("id"));`);
    this.addSql(`alter table "influencer_social_media" add constraint "influencer_social_media_social_media_influencer_id_unique" unique ("social_media", "influencer_id");`);

    this.addSql(`alter table "partnership_format" add constraint "partnership_format_format_company_id_unique" unique ("format", "company_id");`);

    this.addSql(`alter table "influencer_social_media" add constraint "influencer_social_media_influencer_id_foreign" foreign key ("influencer_id") references "influencer" ("id") on delete cascade;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "influencer_social_media" cascade;`);

    this.addSql(`alter table "partnership_format" drop constraint "partnership_format_format_company_id_unique";`);

    this.addSql(`drop type "SocialMedia";`);
  }

}
