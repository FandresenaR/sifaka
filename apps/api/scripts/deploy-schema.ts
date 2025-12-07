import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, PoolConfig } from "@neondatabase/serverless";
import ws from "ws";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configure Neon WebSocket
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = "password";

async function main() {
    console.log("🚀 Starting verification and schema deployment...");

    const host = process.env.NEON_HOST;
    const database = process.env.NEON_DATABASE;
    const user = process.env.NEON_USER;
    const password = process.env.NEON_PASSWORD;
    const connectionString = process.env.DATABASE_URL;

    if (!host && !connectionString) {
        console.error("❌ Missing database configuration");
        process.exit(1);
    }

    // Reuse logic from PrismaService
    let poolConfig: PoolConfig;

    if (host && user && password && database) {
        poolConfig = {
            host,
            database,
            user,
            password,
            ssl: true,
            max: 1,
        };
    } else if (connectionString) {
        console.log("ℹ️ Using connection string parsing");
        const urlKey = new URL(connectionString);
        poolConfig = {
            host: urlKey.hostname,
            database: urlKey.pathname.replace(/^\//, ""),
            user: urlKey.username,
            password: urlKey.password,
            ssl: true,
            max: 1
        };
    } else {
        throw new Error("Invalid config");
    }


    const adapter = new PrismaNeon(poolConfig);
    const prisma = new PrismaClient({ adapter });

    try {
        console.log("Connecting to database...");
        await prisma.$connect();
        console.log("✅ Connected successfully via WebSocket!");

        console.log("📝 Deploying schema...");

        // ENUMS
        await prisma.$executeRawUnsafe(`DO $$ BEGIN CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MANAGER', 'CLIENT'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await prisma.$executeRawUnsafe(`DO $$ BEGIN CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await prisma.$executeRawUnsafe(`DO $$ BEGIN CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await prisma.$executeRawUnsafe(`DO $$ BEGIN CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await prisma.$executeRawUnsafe(`DO $$ BEGIN CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await prisma.$executeRawUnsafe(`DO $$ BEGIN CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'LEAD', 'PROSPECT'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);
        await prisma.$executeRawUnsafe(`DO $$ BEGIN CREATE TYPE "ActivityType" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'COMMENTED', 'ASSIGNED', 'STATUS_CHANGED', 'COMPLETED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`);

        // TABLES
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "name" TEXT,
        "avatar" TEXT,
        "role" "UserRole" NOT NULL DEFAULT 'USER',
        "supabaseId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "lastLoginAt" TIMESTAMP(3),
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `);

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Project" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT,
        "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
        "color" TEXT,
        "startDate" TIMESTAMP(3),
        "endDate" TIMESTAMP(3),
        "budget" DOUBLE PRECISION,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
      );
    `);

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ProjectMember" (
        "id" TEXT NOT NULL,
        "projectId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
      );
    `);

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Task" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
        "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
        "projectId" TEXT NOT NULL,
        "createdById" TEXT NOT NULL,
        "assigneeId" TEXT,
        "dueDate" TIMESTAMP(3),
        "startDate" TIMESTAMP(3),
        "estimatedHours" DOUBLE PRECISION,
        "actualHours" DOUBLE PRECISION,
        "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "order" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "completedAt" TIMESTAMP(3),
        CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
      );
    `);

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "TaskComment" (
        "id" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "taskId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "TaskComment_pkey" PRIMARY KEY ("id")
      );
    `);

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "TaskAttachment" (
        "id" TEXT NOT NULL,
        "filename" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "mimeType" TEXT NOT NULL,
        "size" INTEGER NOT NULL,
        "taskId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "TaskAttachment_pkey" PRIMARY KEY ("id")
      );
    `);

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Client" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT,
        "phone" TEXT,
        "company" TEXT,
        "position" TEXT,
        "address" TEXT,
        "city" TEXT,
        "country" TEXT,
        "website" TEXT,
        "notes" TEXT,
        "status" "ClientStatus" NOT NULL DEFAULT 'ACTIVE',
        "projectId" TEXT,
        "createdById" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
      );
    `);

        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Activity" (
        "id" TEXT NOT NULL,
        "type" "ActivityType" NOT NULL,
        "entityType" TEXT NOT NULL,
        "entityId" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "metadata" JSONB,
        "userId" TEXT,
        "projectId" TEXT,
        "taskId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
      );
    `);

        // INDICES & CONSTRAINTS (executed one by one to ensure safety)

        // User
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");`);
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_supabaseId_key" ON "User"("supabaseId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "User_supabaseId_idx" ON "User"("supabaseId");`);

        // Project
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Project_slug_key" ON "Project"("slug");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Project_slug_idx" ON "Project"("slug");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Project_status_idx" ON "Project"("status");`);

        // ProjectMember
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProjectMember_userId_idx" ON "ProjectMember"("userId");`);
        await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");`);

        // Foreign keys for ProjectMember
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
        } catch (e) { }
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
        } catch (e) { }

        // Task
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Task_projectId_idx" ON "Task"("projectId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Task_status_idx" ON "Task"("status");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Task_priority_idx" ON "Task"("priority");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Task_assigneeId_idx" ON "Task"("assigneeId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Task_createdById_idx" ON "Task"("createdById");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Task_dueDate_idx" ON "Task"("dueDate");`);

        // Foreign keys for Task
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
        } catch (e) { }
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`);
        } catch (e) { }
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);
        } catch (e) { }


        // TaskComment
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "TaskComment_taskId_idx" ON "TaskComment"("taskId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "TaskComment_userId_idx" ON "TaskComment"("userId");`);
        // Foreign keys
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
        } catch (e) { }
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "TaskComment" ADD CONSTRAINT "TaskComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
        } catch (e) { }

        // TaskAttachment
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "TaskAttachment_taskId_idx" ON "TaskAttachment"("taskId");`);
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "TaskAttachment" ADD CONSTRAINT "TaskAttachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;`);
        } catch (e) { }

        // Client
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Client_email_idx" ON "Client"("email");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Client_projectId_idx" ON "Client"("projectId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Client_status_idx" ON "Client"("status");`);
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Client" ADD CONSTRAINT "Client_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);
        } catch (e) { }
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Client" ADD CONSTRAINT "Client_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;`);
        } catch (e) { }

        // Activity
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Activity_entityType_entityId_idx" ON "Activity"("entityType", "entityId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Activity_userId_idx" ON "Activity"("userId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Activity_projectId_idx" ON "Activity"("projectId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Activity_createdAt_idx" ON "Activity"("createdAt");`);
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);
        } catch (e) { }
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Activity" ADD CONSTRAINT "Activity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);
        } catch (e) { }
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "Activity" ADD CONSTRAINT "Activity_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;`);
        } catch (e) { }

        console.log("✅ Schema deployed successfully!");
    } catch (error) {
        console.error("❌ Schema deployment failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
