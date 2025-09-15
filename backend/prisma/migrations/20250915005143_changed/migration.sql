/*
  Warnings:

  - Changed the type of `type` on the `Feed` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."FeedType" AS ENUM ('HABIT_CREATED', 'HABIT_COMPLETED', 'STREAK_UPDATED');

-- AlterTable
ALTER TABLE "public"."Feed" ADD COLUMN     "message" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "public"."FeedType" NOT NULL;
