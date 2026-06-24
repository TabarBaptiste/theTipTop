-- CreateTable
CREATE TABLE "prizes" (
    "id" TEXT NOT NULL,
    "code" "PrizeType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "value" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "totalCount" INTEGER NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prizes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prizes_code_key" ON "prizes"("code");
