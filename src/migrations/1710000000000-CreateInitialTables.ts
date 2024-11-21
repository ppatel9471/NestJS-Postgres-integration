// src/migrations/1710000000000-CreateInitialTables.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1710000000000 implements MigrationInterface {
  name = 'CreateInitialTables1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR NOT NULL,
        "email" VARCHAR NOT NULL UNIQUE,
        "password" VARCHAR NOT NULL,
        "level" INTEGER DEFAULT 1,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Topics table
    await queryRunner.query(`
      CREATE TABLE "topics" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR NOT NULL,
        "icon" VARCHAR NOT NULL,
        "description" TEXT NOT NULL,
        "level" INTEGER DEFAULT 1,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Lessons table
    await queryRunner.query(`
      CREATE TABLE "lessons" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR NOT NULL,
        "description" TEXT NOT NULL,
        "difficulty" VARCHAR NOT NULL,
        "topic_id" INTEGER REFERENCES topics(id) ON DELETE CASCADE,
        "order" INTEGER NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Learning steps table
    await queryRunner.query(`
      CREATE TABLE "learning_steps" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR NOT NULL,
        "type" VARCHAR NOT NULL,
        "content" JSONB NOT NULL,
        "lesson_id" INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        "order" INTEGER NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Progress table
    await queryRunner.query(`
      CREATE TABLE "progress" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        "lesson_id" INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        "completed_steps" INTEGER[] DEFAULT '{}',
        "metadata" JSONB DEFAULT '{}',
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "last_accessed" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Indexes
    await queryRunner.query(`
      CREATE INDEX "idx_users_email" ON "users"("email");
      CREATE INDEX "idx_lessons_topic_id" ON "lessons"("topic_id");
      CREATE INDEX "idx_learning_steps_lesson_id" ON "learning_steps"("lesson_id");
      CREATE INDEX "idx_progress_user_lesson" ON "progress"("user_id", "lesson_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "progress"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "learning_steps"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "lessons"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "topics"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}