import type { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();
const analyticsController = {
  getUserAnalytics: async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;

      // 1. Fetch user data (includes accurate streak information)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          overallStreak: true,
          longestOverallStreak: true
        }
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // 2. Fetch all check-ins for the user
      const checkIns = await prisma.completedHabit.findMany({
        where: { 
          habit: {
            userId: userId
          }
        },
        include: { habit: true },
        orderBy: { date: 'asc' }
      });

      // 3. Prepare data
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

      // 4. Use accurate streak data from user record
      const currentStreak = user.overallStreak || 0;
      const longestStreak = user.longestOverallStreak || 0;

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
      totalHabits: Object.keys(habitStats).length,
      totalCompletions: totalCheckIns,
      currentStreak,
      longestStreak,
      completionRate: totalCheckIns > 0 ? (totalCheckIns / Object.keys(habitStats).length) : 0,
      habitStats,
      streakChart: last30Days
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
},

  getChartData: async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;

      // Get user's habits
      const habits = await prisma.habit.findMany({
        where: { userId },
        include: {
          completedHabits: {
            orderBy: { date: 'desc' },
            take: 30
          }
        }
      });

      // Streak data for the last 30 days
      const today = new Date();
      const streakData = [];
      let currentStreak = 0;
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Check if any habit was completed on this date
        const hasCompletion = habits.some(habit => 
          habit.completedHabits.some(completion => 
            completion.date.toISOString().split('T')[0] === dateStr
          )
        );
        
        if (hasCompletion) {
          currentStreak++;
        } else if (i < 29) { // Don't reset on the first day
          currentStreak = 0;
        }
        
        streakData.push({
          date: dateStr,
          streak: currentStreak
        });
      }

      // Weekly completions (last 7 days)
      const weeklyData = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const completions = habits.reduce((total, habit) => {
          return total + habit.completedHabits.filter(completion =>
            completion.date.toISOString().split('T')[0] === dateStr
          ).length;
        }, 0);
        
        weeklyData.push({
          day: dayNames[date.getDay()],
          completions
        });
      }

      // Habit completion distribution
      const completionData = habits.map((habit, index) => ({
        habit: habit.name,
        completions: habit.completedHabits.length,
        color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
      }));

      res.json({
        streakData,
        weeklyData,
        completionData
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  }
};

export default analyticsController;