-- CreateTable for ProjectModuleDefinition
CREATE TABLE IF NOT EXISTS "ProjectModuleDefinition" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "moduleName" TEXT NOT NULL,
    "displayName" TEXT,
    "description" TEXT,
    "schema" JSONB NOT NULL,
    "routes" JSONB,
    "validations" JSONB,
    "relationships" JSONB,
    "indexes" TEXT[],
    "generatedBy" TEXT,
    "aiModel" TEXT,
    "aiPrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectModuleDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectModuleDefinition_projectId_moduleName_key" 
  ON "ProjectModuleDefinition"("projectId", "moduleName");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ProjectModuleDefinition_projectId_idx" 
  ON "ProjectModuleDefinition"("projectId");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "ProjectModuleDefinition" 
    ADD CONSTRAINT "ProjectModuleDefinition_projectId_fkey" 
    FOREIGN KEY ("projectId") 
    REFERENCES "Project"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
