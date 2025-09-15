import { PrismaClient } from "../generated/prisma";
import type { Request, Response } from "express";
import { comparePassword, hashPassword } from "../utils/hash";
import { loginSchema, signupSchema, type SignupInput } from "../types/types";
import { hash } from "bcrypt";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";

const prisma = new PrismaClient();


const authController = {
    register: async (req: Request, res: Response) => {
        try {
            const ParsedBody = signupSchema.safeParse(req.body);
            if (!ParsedBody.success) {
                return res.status(400).json({ message: 'Invalid input' });
            }

            const { name, email, password } = ParsedBody.data;


            const existingUser = await prisma.user.findUnique({ where: { email: email } });

            if (existingUser) {
                return res.status(409).json({ message: 'User already exists' });
            }

            const hashedPassword = await hashPassword(password);


            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name
                }
            });
            // Generate tokens
            const accessToken = generateAccessToken(user.id);
            const refreshToken = generateRefreshToken(user.id);

            // Set refresh token as HttpOnly cookie
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            // Return access token and user info
            res.status(201).json({
                accessToken,
                user: { email: user.email, name: user.name },
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },

    login: async (req: Request, res: Response) => {
        try {

            const ParsedBody = loginSchema.safeParse(req.body);
            if (!ParsedBody.success) {
                return res.status(400).json({ message: 'Invalid input' });
            }

            const { email, password } = ParsedBody.data;

            const user = await prisma.user.findUnique({ where: { email } });
            if (!user || !user.password) {
                return res.status(401).json({ message: 'User not found' });
            }

            const isPasswordValid = await comparePassword(password, user?.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const accessToken = generateAccessToken(user.id);
            const refreshToken = generateRefreshToken(user.id);

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            res.json({ accessToken, user: {email: user.email, name: user.name } });
        } catch (err: any) {
            res.status(401).json({ message: err.message });
        }
    },

    refresh: async (req: Request, res: Response) => {
        try {
            const token = req.cookies.refreshToken;
            if (!token) throw new Error("No refresh token");

            const payload: any = verifyRefreshToken(token);
            const newAccessToken = generateAccessToken(payload.userId);
            const newRefreshToken = generateRefreshToken(payload.userId);

            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            res.json({ accessToken: newAccessToken });
        } catch (err: any) {
            res.status(401).json({ message: err.message });
        }
    },

    logout: (req: Request, res: Response) => {
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out" });
    },
};

export { authController };