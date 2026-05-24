-- CreateEnum
CREATE TYPE "Language" AS ENUM ('ENGLISH', 'HINDI');

-- CreateEnum
CREATE TYPE "CropCategory" AS ENUM ('GRAIN', 'OILSEED', 'VEGETABLE', 'FRUIT', 'FIBER', 'SPICE', 'PULSE', 'OTHER');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('KHARIF', 'RABI', 'ZAID');

-- CreateEnum
CREATE TYPE "Trend" AS ENUM ('RISING', 'FALLING', 'STABLE');

-- CreateEnum
CREATE TYPE "AlertCondition" AS ENUM ('ABOVE', 'BELOW');

-- CreateEnum
CREATE TYPE "AlertChannel" AS ENUM ('SMS', 'WHATSAPP', 'EMAIL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "state" TEXT,
    "district" TEXT,
    "language" "Language" NOT NULL DEFAULT 'ENGLISH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameHindi" TEXT NOT NULL,
    "category" "CropCategory" NOT NULL,
    "season" "Season"[],
    "unit" TEXT NOT NULL DEFAULT 'quintal',
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_crops" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "mandiId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_crops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mandis" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameHindi" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "agmarknetId" TEXT,
    "timings" TEXT,
    "facilities" TEXT[],
    "rating" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mandis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_records" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "mandiId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "minPrice" DOUBLE PRECISION,
    "maxPrice" DOUBLE PRECISION,
    "modalPrice" DOUBLE PRECISION,
    "arrivalQty" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'agmarknet',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_predictions" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "mandiId" TEXT NOT NULL,
    "predictedPrice" DOUBLE PRECISION NOT NULL,
    "minPrice" DOUBLE PRECISION,
    "maxPrice" DOUBLE PRECISION,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "horizon" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "modelVersion" TEXT NOT NULL DEFAULT 'prophet-v1',
    "trend" "Trend" NOT NULL DEFAULT 'STABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "mandiId" TEXT,
    "targetPrice" DOUBLE PRECISION NOT NULL,
    "condition" "AlertCondition" NOT NULL,
    "channels" "AlertChannel"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggered" BOOLEAN NOT NULL DEFAULT false,
    "triggeredAt" TIMESTAMP(3),
    "triggeredPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "cropName" TEXT NOT NULL,
    "district" TEXT,
    "state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather_cache" (
    "id" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "rainfall" DOUBLE PRECISION,
    "condition" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weather_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_clerkId_idx" ON "users"("clerkId");

-- CreateIndex
CREATE INDEX "crops_category_idx" ON "crops"("category");

-- CreateIndex
CREATE UNIQUE INDEX "user_crops_userId_cropId_key" ON "user_crops"("userId", "cropId");

-- CreateIndex
CREATE UNIQUE INDEX "mandis_agmarknetId_key" ON "mandis"("agmarknetId");

-- CreateIndex
CREATE INDEX "mandis_state_district_idx" ON "mandis"("state", "district");

-- CreateIndex
CREATE INDEX "mandis_latitude_longitude_idx" ON "mandis"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "price_records_cropId_date_idx" ON "price_records"("cropId", "date");

-- CreateIndex
CREATE INDEX "price_records_mandiId_date_idx" ON "price_records"("mandiId", "date");

-- CreateIndex
CREATE INDEX "price_records_date_idx" ON "price_records"("date");

-- CreateIndex
CREATE UNIQUE INDEX "price_records_cropId_mandiId_date_key" ON "price_records"("cropId", "mandiId", "date");

-- CreateIndex
CREATE INDEX "price_predictions_cropId_targetDate_idx" ON "price_predictions"("cropId", "targetDate");

-- CreateIndex
CREATE UNIQUE INDEX "price_predictions_cropId_mandiId_targetDate_horizon_key" ON "price_predictions"("cropId", "mandiId", "targetDate", "horizon");

-- CreateIndex
CREATE INDEX "alerts_userId_isActive_idx" ON "alerts"("userId", "isActive");

-- CreateIndex
CREATE INDEX "alerts_cropId_isActive_idx" ON "alerts"("cropId", "isActive");

-- CreateIndex
CREATE INDEX "search_logs_cropName_idx" ON "search_logs"("cropName");

-- CreateIndex
CREATE INDEX "weather_cache_district_state_idx" ON "weather_cache"("district", "state");

-- CreateIndex
CREATE UNIQUE INDEX "weather_cache_district_state_key" ON "weather_cache"("district", "state");

-- AddForeignKey
ALTER TABLE "user_crops" ADD CONSTRAINT "user_crops_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_crops" ADD CONSTRAINT "user_crops_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "crops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_crops" ADD CONSTRAINT "user_crops_mandiId_fkey" FOREIGN KEY ("mandiId") REFERENCES "mandis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_records" ADD CONSTRAINT "price_records_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "crops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_records" ADD CONSTRAINT "price_records_mandiId_fkey" FOREIGN KEY ("mandiId") REFERENCES "mandis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_predictions" ADD CONSTRAINT "price_predictions_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "crops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_predictions" ADD CONSTRAINT "price_predictions_mandiId_fkey" FOREIGN KEY ("mandiId") REFERENCES "mandis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "crops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_logs" ADD CONSTRAINT "search_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
