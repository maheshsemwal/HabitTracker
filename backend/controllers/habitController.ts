import { PrismaClient } from "../generated/prisma";
import type { Request, Response } from "express";
import { createHabitSchema, updateHabitSchema } from "../types/types";
import { createFeed } from "../utilites/feedUpdate";
const prisma = new PrismaClient();

const habitController = {
    createHabit: async (req: Request, res: Response) => {
        try {
            const parsed = createHabitSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: "Invalid input" });
            }
            const { name, description, frequency, category } = parsed.data;
            const userId = (req as any).userId;
            const habit = await prisma.habit.create({
                data: {
                    name,
                    description,
                    frequency,
                    category,
                    userId
                }
            });

            await createFeed(userId, "HABIT_CREATED", habit.id, `🌱 Started habit: ${habit.name}`);
            return res.status(201).json(habit);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    getHabits: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).userId;

            const habits = await prisma.habit.findMany({
                where: { userId },
                include: { completedHabits: true },
            });

            return res.status(200).json(habits);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    updateHabit: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const parsed = updateHabitSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: "Invalid input" });
            }

            const userId = (req as any).userId;

            const habit = await prisma.habit.findUnique({ where: { id: id } });
            if (!habit || habit.userId !== userId) {
                return res.status(404).json({ error: "Habit not found" });
            }

            const updatedHabit = await prisma.habit.update({
                where: { id: id },
                data: parsed.data,
            });

            return res.status(200).json(updatedHabit);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    deleteHabit: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = (req as any).userId;

            const habit = await prisma.habit.findUnique({ where: { id: id } });
            if (!habit || habit.userId !== userId) {
                return res.status(404).json({ error: "Habit not found" });
            }

            await prisma.habit.delete({ where: { id: id } });
            return res.status(204).send();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },
};

export default habitController;
