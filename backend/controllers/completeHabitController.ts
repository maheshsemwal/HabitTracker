import { PrismaClient } from "../generated/prisma";
import type { Request, Response } from "express";
import {createFeed } from "../utilites/feedUpdate";

const prisma = new PrismaClient();

export const completeHabitController = {

    markAsCompleted: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = (req as any).userId;

            if (!id) {
                return res.status(400).json({ error: "Habit ID is required" });
            }

            const habit = await prisma.habit.findUnique({ where: { id } });
            if (!habit || habit.userId !== userId) {
                return res.status(404).json({ error: "Habit not found" });
            }

            let start: Date;
            let end: Date;
            const now = new Date();

            if (habit.frequency === 'DAILY') {
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            } else if (habit.frequency === 'WEEKLY') {
                const day = now.getDay() || 7; // treat Sunday as 7
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 8);
            } else { // MONTHLY
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            }

            const alreadyCompleted = await prisma.completedHabit.findFirst({
                where: {
                    habitId: id,
                    date: {
                        gte: start,
                        lt: end
                    }
                }
            });
            if (alreadyCompleted) {
                return res.status(400).json({ error: "Habit already marked as completed for this period" });
            }

            const completedHabit = await prisma.completedHabit.create({
                data: {
                    habitId: id,
                    date: new Date()
                }
            });


            // --- Streak Logic ---
            let newStreak = habit.currentStreak;
            if (habit.lastCompletedAt) {
                const diff = Math.floor(
                    (now.getTime() - habit.lastCompletedAt.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (diff === 1) {
                    newStreak = habit.currentStreak + 1; // consecutive day
                } else if (diff > 1) {
                    newStreak = 1; // reset streak
                }
            } else {
                newStreak = 1; // first completion
            }

            const updatedHabit = await prisma.habit.update({
                where: { id },
                data: {
                    currentStreak: newStreak,
                    longestStreak: Math.max(newStreak, habit.longestStreak),
                    lastCompletedAt: now,
                },
            });

            // --- Feed Entries ---
            await createFeed(userId, "HABIT_COMPLETED", id, `✅ Completed: ${habit.name}`);
            if (newStreak > habit.currentStreak) {
                await createFeed(
                    userId,
                    "STREAK_UPDATED",
                    id,
                    `🔥 ${newStreak}-day streak on ${habit.name}`
                );
            }

            return res.status(201).json(completedHabit);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    // Get history of completions for a habit
    getHistory: async (req: Request, res: Response) => {
        try {
            const userId = req.userId;
            const { habitId } = req.params;

            const habit = await prisma.habit.findUnique({ where: { id: habitId } });
            if (!habit || habit.userId !== userId) {
                return res.status(404).json({ message: "Habit not found" });
            }

            const completions = await prisma.completedHabit.findMany({
                where: { habitId },
                orderBy: { date: "desc" },
            });

            res.json({ habitId, completions });
        } catch (err: any) {
            res.status(500).json({ message: err.message });
        }
    },
};