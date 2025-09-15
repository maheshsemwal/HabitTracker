import type { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

const feedController = {
  // 1. Get feed of all posts from users I follow
  getMyFeed: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;

      // Find all the users current user follows
      const following = await prisma.follow.findMany({
        where: { followerId: userId, status: "ACCEPTED" },
        select: { userId: true },
      });

      const followingIds = following.map(f => f.userId);

      // Include my own posts also
      followingIds.push(userId);

      const posts = await prisma.feed.findMany({
        where: { userId: { in: followingIds } },
        include: {
          user: { select: { id: true, name: true, email: true } },
          habit: { select: { id: true, name: true, category: true } }
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json(posts);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  // 2. Get feed of a specific user (profile page)
  getUserFeed: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const posts = await prisma.feed.findMany({
        where: { userId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          habit: { select: { id: true, name: true, category: true } }
        },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json(posts);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
};

export default feedController;
