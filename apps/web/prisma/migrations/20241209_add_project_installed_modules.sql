-- CreateTable "ProjectInstalledModule"
CREATE TABLE "ProjectInstalledModule" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "customConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectInstalledModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectInstalledModule_projectId_moduleId_key" ON "ProjectInstalledModule"("projectId", "moduleId");

-- CreateIndex
CREATE INDEX "ProjectInstalledModule_projectId_idx" ON "ProjectInstalledModule"("projectId");

-- CreateIndex
CREATE INDEX "ProjectInstalledModule_moduleId_idx" ON "ProjectInstalledModule"("moduleId");

-- AddForeignKey
ALTER TABLE "ProjectInstalledModule" ADD CONSTRAINT "ProjectInstalledModule_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInstalledModule" ADD CONSTRAINT "ProjectInstalledModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "ProjectModuleDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
