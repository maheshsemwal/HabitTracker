-- AlterTable
ALTER TABLE "public"."Habit" ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastCompletedAt" TIMESTAMP(3),
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "longestOverallStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "overallStreak" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."Feed" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feed_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Feed" ADD CONSTRAINT "Feed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feed" ADD CONSTRAINT "Feed_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "public"."Habit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
