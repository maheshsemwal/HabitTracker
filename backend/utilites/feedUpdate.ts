import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();

export const createFeed = async (userId: string, type: "HABIT_CREATED" | "HABIT_COMPLETED" | "STREAK_UPDATED", habitId: string, message?: string) => {
  return await prisma.feed.create({
    data: {
        userId,
        type,
        habitId,
        message: message || null
    }
  });
};
