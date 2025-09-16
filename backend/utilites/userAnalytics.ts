import type { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();
export const getUserAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    // 1. Fetch all check-ins for the user
    const checkIns = await prisma.completedHabit.findMany({
      where: { 
        habit: {
          userId: userId
        }
      },
      include: { habit: true },
      orderBy: { date: 'asc' }
    });

    // 2. Prepare data
    const totalCheckIns = checkIns.length;

    // Group check-ins by habit
    const habitStats: Record<string, { name: string; total: number; dates: string[] }> = {};
    checkIns.forEach(c => {
      if (!habitStats[c.habitId]) {
        habitStats[c.habitId] = {
          name: c.habit.name,
          total: 0,
          dates: []
        };
      }
      const stat = habitStats[c.habitId];
      if (stat) {
        stat.total++;
        stat.dates.push(new Date(c.date).toDateString());
      }
    });

    // 3. Current streak & longest streak across all habits (by unique days)
    let currentStreak = 0, longestStreak = 0;
    const uniqueDates = Array.from(new Set(checkIns.map(c => new Date(c.date).toDateString()))).sort();
    
    // Calculate streaks based on consecutive days
    let tempStreak = 0;
    let prevDate: Date | null = null;
    
    uniqueDates.forEach(dateStr => {
      const date = new Date(dateStr);
      if (prevDate) {
        const diff = Math.floor((date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1; // reset streak, but start new one
        }
      } else {
        tempStreak = 1; // first day
      }
      longestStreak = Math.max(longestStreak, tempStreak);
      prevDate = date;
    });

    // Current streak is the streak including today
    const todayStr = new Date().toDateString();
    const lastActivityDate = uniqueDates[uniqueDates.length - 1];
    
    if (lastActivityDate === todayStr || 
        (lastActivityDate && Math.floor((new Date(todayStr).getTime() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)) === 1)) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0; // streak broken
    }

    // 4. Last 30 days heatmap data
    const today = new Date();
    const last30Days: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toDateString();
      const count = checkIns.filter(c => new Date(c.date).toDateString() === dateStr).length;
      last30Days.push({ date: dateStr, count });
    }

    // 5. Return everything
    res.json({
      totalCheckIns,
      currentStreak,
      longestStreak,
      habitStats,
      streakChart: last30Days
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
