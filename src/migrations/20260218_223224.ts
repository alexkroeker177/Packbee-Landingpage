import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_knowledge_base_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__knowledge_base_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "knowledge_base" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"section_id" integer,
  	"body" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"meta_canonical_u_r_l" varchar,
  	"meta_og_title" varchar,
  	"meta_no_index" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_knowledge_base_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_knowledge_base_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_section_id" integer,
  	"version_body" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_canonical_u_r_l" varchar,
  	"version_meta_og_title" varchar,
  	"version_meta_no_index" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__knowledge_base_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  ALTER TABLE "posts" ADD COLUMN "meta_canonical_u_r_l" varchar;
  ALTER TABLE "posts" ADD COLUMN "meta_og_title" varchar;
  ALTER TABLE "posts" ADD COLUMN "meta_no_index" boolean DEFAULT false;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_canonical_u_r_l" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_og_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_no_index" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "knowledge_base_id" integer;
  ALTER TABLE "knowledge_base" ADD CONSTRAINT "knowledge_base_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "knowledge_base" ADD CONSTRAINT "knowledge_base_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_knowledge_base_v" ADD CONSTRAINT "_knowledge_base_v_parent_id_knowledge_base_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."knowledge_base"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_knowledge_base_v" ADD CONSTRAINT "_knowledge_base_v_version_section_id_sections_id_fk" FOREIGN KEY ("version_section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_knowledge_base_v" ADD CONSTRAINT "_knowledge_base_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "knowledge_base_slug_idx" ON "knowledge_base" USING btree ("slug");
  CREATE INDEX "knowledge_base_section_idx" ON "knowledge_base" USING btree ("section_id");
  CREATE INDEX "knowledge_base_meta_meta_image_idx" ON "knowledge_base" USING btree ("meta_image_id");
  CREATE INDEX "knowledge_base_updated_at_idx" ON "knowledge_base" USING btree ("updated_at");
  CREATE INDEX "knowledge_base_created_at_idx" ON "knowledge_base" USING btree ("created_at");
  CREATE INDEX "knowledge_base__status_idx" ON "knowledge_base" USING btree ("_status");
  CREATE INDEX "_knowledge_base_v_parent_idx" ON "_knowledge_base_v" USING btree ("parent_id");
  CREATE INDEX "_knowledge_base_v_version_version_slug_idx" ON "_knowledge_base_v" USING btree ("version_slug");
  CREATE INDEX "_knowledge_base_v_version_version_section_idx" ON "_knowledge_base_v" USING btree ("version_section_id");
  CREATE INDEX "_knowledge_base_v_version_meta_version_meta_image_idx" ON "_knowledge_base_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_knowledge_base_v_version_version_updated_at_idx" ON "_knowledge_base_v" USING btree ("version_updated_at");
  CREATE INDEX "_knowledge_base_v_version_version_created_at_idx" ON "_knowledge_base_v" USING btree ("version_created_at");
  CREATE INDEX "_knowledge_base_v_version_version__status_idx" ON "_knowledge_base_v" USING btree ("version__status");
  CREATE INDEX "_knowledge_base_v_created_at_idx" ON "_knowledge_base_v" USING btree ("created_at");
  CREATE INDEX "_knowledge_base_v_updated_at_idx" ON "_knowledge_base_v" USING btree ("updated_at");
  CREATE INDEX "_knowledge_base_v_latest_idx" ON "_knowledge_base_v" USING btree ("latest");
  CREATE INDEX "_knowledge_base_v_autosave_idx" ON "_knowledge_base_v" USING btree ("autosave");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_knowledge_base_fk" FOREIGN KEY ("knowledge_base_id") REFERENCES "public"."knowledge_base"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_knowledge_base_id_idx" ON "payload_locked_documents_rels" USING btree ("knowledge_base_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "knowledge_base" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_knowledge_base_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "knowledge_base" CASCADE;
  DROP TABLE "_knowledge_base_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_knowledge_base_fk";
  
  DROP INDEX "payload_locked_documents_rels_knowledge_base_id_idx";
  ALTER TABLE "posts" DROP COLUMN "meta_canonical_u_r_l";
  ALTER TABLE "posts" DROP COLUMN "meta_og_title";
  ALTER TABLE "posts" DROP COLUMN "meta_no_index";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_canonical_u_r_l";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_og_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_no_index";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "knowledge_base_id";
  DROP TYPE "public"."enum_knowledge_base_status";
  DROP TYPE "public"."enum__knowledge_base_v_version_status";`)
}
