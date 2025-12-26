-- CreateTable "UserPreference"
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "lastLocationUpdate" TIMESTAMP(3),
    "defaultRadius" INTEGER NOT NULL DEFAULT 50,
    "preferredTypes" TEXT[],
    "minRating" DOUBLE PRECISION NOT NULL DEFAULT 3.5,
    "notifyNewActivities" BOOLEAN NOT NULL DEFAULT true,
    "notificationRadius" INTEGER NOT NULL DEFAULT 50,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable "UserActivity"
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "radius" INTEGER NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable "FavoriteActivity"
CREATE TABLE "FavoriteActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "address" TEXT,
    "notes" TEXT,
    "visited" BOOLEAN NOT NULL DEFAULT false,
    "rating_" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FavoriteActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable "ShuffleLifeSubscription"
CREATE TABLE "ShuffleLifeSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'FREE',
    "maxRadius" INTEGER NOT NULL DEFAULT 50,
    "status" TEXT NOT NULL DEFAULT 'active',
    "stripeId" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "features" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShuffleLifeSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "UserPreference_userId_idx" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "UserActivity_userId_idx" ON "UserActivity"("userId");

-- CreateIndex
CREATE INDEX "UserActivity_createdAt_idx" ON "UserActivity"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteActivity_userId_placeId_key" ON "FavoriteActivity"("userId", "placeId");

-- CreateIndex
CREATE INDEX "FavoriteActivity_userId_idx" ON "FavoriteActivity"("userId");

-- CreateIndex
CREATE INDEX "FavoriteActivity_visited_idx" ON "FavoriteActivity"("visited");

-- CreateIndex
CREATE UNIQUE INDEX "ShuffleLifeSubscription_userId_key" ON "ShuffleLifeSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ShuffleLifeSubscription_stripeId_key" ON "ShuffleLifeSubscription"("stripeId");

-- CreateIndex
CREATE INDEX "ShuffleLifeSubscription_userId_idx" ON "ShuffleLifeSubscription"("userId");

-- CreateIndex
CREATE INDEX "ShuffleLifeSubscription_tier_idx" ON "ShuffleLifeSubscription"("tier");

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteActivity" ADD CONSTRAINT "FavoriteActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShuffleLifeSubscription" ADD CONSTRAINT "ShuffleLifeSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
