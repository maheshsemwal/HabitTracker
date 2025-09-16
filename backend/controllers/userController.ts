import type { Request, Response } from "express";
import { PrismaClient } from "../generated/prisma";
import { RespondRequestSchema } from "../types/types";

const prisma = new PrismaClient();
const userController = {
    sendRequest: async (req: Request, res: Response) => {
        try {
            const { userId } = req.body; // ID of the user to follow
            const followerId = (req as any).userId; // ID of the current user

            if(!userId) {
                return res.status(400).json({ error: "User ID is required" });
            }

            if (userId === followerId) {
                return res.status(400).json({ error: "You cannot follow yourself" });
            }

            const existingRequest = await prisma.follow.findFirst({
                where: {
                    userId,
                    followerId,
                    status: {
                        in: ['PENDING', 'ACCEPTED']
                    }
                }
            });
            if (existingRequest) {
                if (existingRequest.status === 'ACCEPTED') {
                    return res.status(400).json({ error: "You are already following this user" });
                } else {
                    return res.status(400).json({ error: "Follow request already sent" });
                }
            }

            // Check if there's a rejected request we need to update
            const rejectedRequest = await prisma.follow.findFirst({
                where: {
                    userId,
                    followerId,
                    status: 'REJECTED'
                }
            });

            let followRequest;
            if (rejectedRequest) {
                // Update the rejected request to pending
                followRequest = await prisma.follow.update({
                    where: {
                        id: rejectedRequest.id
                    },
                    data: {
                        status: 'PENDING',
                        updatedAt: new Date()
                    }
                });
            } else {
                // Create a new request
                followRequest = await prisma.follow.create({
                    data: {
                        userId,
                        followerId
                    }
                });
            }
            return res.status(201).json(followRequest);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    respondRequest: async (req: Request, res: Response) => {
        try {
            
            const userId = (req as any).userId; // ID of the current user

            const parsedBody = RespondRequestSchema.safeParse(req.body);

            if(!parsedBody.success) {
                return res.status(400).json({ error: "Invalid input" });
            }
            
            const { requestId, action } = parsedBody.data;
            const followRequest = await prisma.follow.findUnique({ where: { id: requestId } });

            if(!followRequest || followRequest.userId !== userId) {
                return res.status(404).json({ error: "Follow request not found" });
            }

            if(followRequest.status !== 'PENDING') {
                return res.status(400).json({ error: "Follow request already responded to" });
            }

            const updatedRequest = await prisma.follow.update({
                where: { id: requestId },
                data: { status: action }
            });
            return res.status(200).json(updatedRequest);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    getRequests: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).userId; // ID of the current user
            
            const requests = await prisma.follow.findMany({
                where: { userId, status: 'PENDING' },
                include: { 
                    follower: { select: { id: true, name: true, email: true } } 
                }
            });
            return res.status(200).json(requests);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    // followers of a user
    getFollowers: async (req: Request, res: Response) => {
        try {
            const userId = req.params.id;

            const followers = await prisma.follow.findMany({
                where: { userId, status: 'ACCEPTED' },
                include: { follower: { select: { id: true, name: true, email: true } } }
            });
            return res.status(200).json(followers.map(f => f.follower));
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    // following of a user
    getFollowing: async (req: Request, res: Response) => {
        try {
            const userId = req.params.id; 

            const following = await prisma.follow.findMany({
                where: { followerId: userId, status: 'ACCEPTED' },
                include: { user: { select: { id: true, name: true, email: true } } }
            });
            return res.status(200).json(following.map(f => f.user));
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },

    searchUsers: async (req: Request, res: Response) => {
    try {
      const { q } = req.query; // search query

      if (!q || typeof q !== "string") {
        return res.status(400).json({ error: "Search query is required" });
      }

      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, email: true },
        take: 20, // limit results
      });

      return res.status(200).json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  getUserProfile: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, 
          name: true, 
          email: true, 
          overallStreak: true, 
          longestOverallStreak: true, 
          createdAt: true 
        }
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },



};

export default userController;