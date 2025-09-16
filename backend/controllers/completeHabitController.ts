import { PrismaClient } from "../generated/prisma";
import type { Request, Response } from "express";
import {createFeed } from "../utilites/feedUpdate";

const prisma = new PrismaClient();

// Helper function to check if two periods are consecutive
const isConsecutivePeriod = (prevPeriod: string, currentPeriod: string): boolean => {
    // Handle daily periods (date strings)
    if (prevPeriod.includes(' ') && currentPeriod.includes(' ')) {
        const prevDate = new Date(prevPeriod);
        const currDate = new Date(currentPeriod);
        const diff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        return diff === 1;
    }
    
    // Handle weekly periods (YYYY-WW format)
    if (prevPeriod.includes('-W') && currentPeriod.includes('-W')) {
        const prevParts = prevPeriod.split('-W');
        const currParts = currentPeriod.split('-W');
        
        if (prevParts.length === 2 && currParts.length === 2) {
            const prevYear = Number(prevParts[0]);
            const prevWeek = Number(prevParts[1]);
            const currYear = Number(currParts[0]);
            const currWeek = Number(currParts[1]);
            
            if (prevYear === currYear) {
                return currWeek === prevWeek + 1;
            } else if (currYear === prevYear + 1) {
                return prevWeek >= 52 && currWeek === 1; // Year transition
            }
        }
        return false;
    }
    
    // Handle monthly periods (YYYY-MM format)
    if (prevPeriod.includes('-') && !prevPeriod.includes('-W') && 
        currentPeriod.includes('-') && !currentPeriod.includes('-W')) {
        const prevParts = prevPeriod.split('-');
        const currParts = currentPeriod.split('-');
        
        if (prevParts.length === 2 && currParts.length === 2) {
            const prevYear = Number(prevParts[0]);
            const prevMonth = Number(prevParts[1]);
            const currYear = Number(currParts[0]);
            const currMonth = Number(currParts[1]);
            
            if (prevYear === currYear) {
                return currMonth === prevMonth + 1;
            } else if (currYear === prevYear + 1) {
                return prevMonth === 12 && currMonth === 1; // Year transition
            }
        }
        return false;
    }
    
    return false;
};

// Helper function to update user's overall streak
const updateUserOverallStreak = async (userId: string) => {
    // Get all completed habits for the user
    const completions = await prisma.completedHabit.findMany({
        where: {
            habit: {
                userId: userId
            }
        },
        orderBy: { date: 'asc' }
    });

    if (completions.length === 0) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                overallStreak: 0,
                longestOverallStreak: 0
            }
        });
        return;
    }

    // Get unique dates when ANY habit was completed
    const uniqueDates = Array.from(new Set(completions.map(c => {
        const date = new Date(c.date);
        // Normalize to local date string to avoid timezone issues
        return date.toDateString();
    }))).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Calculate streaks based on consecutive days
    for (let i = 0; i < uniqueDates.length; i++) {
        const currentDateStr = uniqueDates[i];
        if (!currentDateStr) continue;
        
        const currentDate = new Date(currentDateStr);
        
        if (i === 0) {
            tempStreak = 1;
        } else {
            const prevDateStr = uniqueDates[i - 1];
            if (!prevDateStr) continue;
            
            const prevDate = new Date(prevDateStr);
            const diffTime = currentDate.getTime() - prevDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                // Consecutive day
                tempStreak++;
            } else {
                // Streak broken, start new streak
                tempStreak = 1;
            }
        }
        
        longestStreak = Math.max(longestStreak, tempStreak);
    }

    // Determine current active streak
    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString();
    const lastActivityDate = uniqueDates[uniqueDates.length - 1];
    
    // Current streak is active if last activity was today or yesterday
    if (lastActivityDate === today || lastActivityDate === yesterday) {
        currentStreak = tempStreak;
    } else {
        currentStreak = 0; // Streak broken
    }

    // Update user's overall streak in database
    await prisma.user.update({
        where: { id: userId },
        data: {
            overallStreak: currentStreak,
            longestOverallStreak: Math.max(longestStreak, currentStreak)
        }
    });
};

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

            // --- Update User Overall Streak ---
            await updateUserOverallStreak(userId);

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
            const habitId = req.params.id; // Use 'id' to match the route parameter

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