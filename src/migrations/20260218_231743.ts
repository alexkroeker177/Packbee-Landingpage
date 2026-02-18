import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_content_type" AS ENUM('article', 'tutorial');
  CREATE TYPE "public"."enum__posts_v_version_content_type" AS ENUM('article', 'tutorial');
  CREATE TYPE "public"."enum_knowledge_base_article_type" AS ENUM('standard', 'faq');
  CREATE TYPE "public"."enum__knowledge_base_v_version_article_type" AS ENUM('standard', 'faq');
  CREATE TABLE "posts_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "_posts_v_version_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "knowledge_base_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "_knowledge_base_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "search" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"priority" numeric,
  	"excerpt" varchar,
  	"section_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "search_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"knowledge_base_id" integer
  );
  
  ALTER TABLE "posts" ADD COLUMN "content_type" "enum_posts_content_type" DEFAULT 'article';
  ALTER TABLE "_posts_v" ADD COLUMN "version_content_type" "enum__posts_v_version_content_type" DEFAULT 'article';
  ALTER TABLE "knowledge_base" ADD COLUMN "excerpt" varchar;
  ALTER TABLE "knowledge_base" ADD COLUMN "article_type" "enum_knowledge_base_article_type" DEFAULT 'standard';
  ALTER TABLE "_knowledge_base_v" ADD COLUMN "version_excerpt" varchar;
  ALTER TABLE "_knowledge_base_v" ADD COLUMN "version_article_type" "enum__knowledge_base_v_version_article_type" DEFAULT 'standard';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "search_id" integer;
  ALTER TABLE "posts_steps" ADD CONSTRAINT "posts_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_steps" ADD CONSTRAINT "_posts_v_version_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "knowledge_base_faqs" ADD CONSTRAINT "knowledge_base_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."knowledge_base"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_knowledge_base_v_version_faqs" ADD CONSTRAINT "_knowledge_base_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_knowledge_base_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search" ADD CONSTRAINT "search_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_rels" ADD CONSTRAINT "search_rels_knowledge_base_fk" FOREIGN KEY ("knowledge_base_id") REFERENCES "public"."knowledge_base"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_steps_order_idx" ON "posts_steps" USING btree ("_order");
  CREATE INDEX "posts_steps_parent_id_idx" ON "posts_steps" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_version_steps_order_idx" ON "_posts_v_version_steps" USING btree ("_order");
  CREATE INDEX "_posts_v_version_steps_parent_id_idx" ON "_posts_v_version_steps" USING btree ("_parent_id");
  CREATE INDEX "knowledge_base_faqs_order_idx" ON "knowledge_base_faqs" USING btree ("_order");
  CREATE INDEX "knowledge_base_faqs_parent_id_idx" ON "knowledge_base_faqs" USING btree ("_parent_id");
  CREATE INDEX "_knowledge_base_v_version_faqs_order_idx" ON "_knowledge_base_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_knowledge_base_v_version_faqs_parent_id_idx" ON "_knowledge_base_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "search_section_idx" ON "search" USING btree ("section_id");
  CREATE INDEX "search_updated_at_idx" ON "search" USING btree ("updated_at");
  CREATE INDEX "search_created_at_idx" ON "search" USING btree ("created_at");
  CREATE INDEX "search_rels_order_idx" ON "search_rels" USING btree ("order");
  CREATE INDEX "search_rels_parent_idx" ON "search_rels" USING btree ("parent_id");
  CREATE INDEX "search_rels_path_idx" ON "search_rels" USING btree ("path");
  CREATE INDEX "search_rels_knowledge_base_id_idx" ON "search_rels" USING btree ("knowledge_base_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_fk" FOREIGN KEY ("search_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_search_id_idx" ON "payload_locked_documents_rels" USING btree ("search_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_version_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "knowledge_base_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_knowledge_base_v_version_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "search" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "search_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "posts_steps" CASCADE;
  DROP TABLE "_posts_v_version_steps" CASCADE;
  DROP TABLE "knowledge_base_faqs" CASCADE;
  DROP TABLE "_knowledge_base_v_version_faqs" CASCADE;
  DROP TABLE "search" CASCADE;
  DROP TABLE "search_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_search_fk";
  
  DROP INDEX "payload_locked_documents_rels_search_id_idx";
  ALTER TABLE "posts" DROP COLUMN "content_type";
  ALTER TABLE "_posts_v" DROP COLUMN "version_content_type";
  ALTER TABLE "knowledge_base" DROP COLUMN "excerpt";
  ALTER TABLE "knowledge_base" DROP COLUMN "article_type";
  ALTER TABLE "_knowledge_base_v" DROP COLUMN "version_excerpt";
  ALTER TABLE "_knowledge_base_v" DROP COLUMN "version_article_type";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "search_id";
  DROP TYPE "public"."enum_posts_content_type";
  DROP TYPE "public"."enum__posts_v_version_content_type";
  DROP TYPE "public"."enum_knowledge_base_article_type";
  DROP TYPE "public"."enum__knowledge_base_v_version_article_type";`)
}
