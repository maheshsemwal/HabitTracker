import { password } from "bun";
import { request } from "express";
import z from "zod";
import { ca } from "zod/locales";


//authSchemas
const signupSchema = z.object({
    name: z.string().min(3).max(100),
    email: z.email(),
    password: z.string().min(6).max(100)
})

const loginSchema = z.object({
    email: z.email(),
    password: z.string()
})


// habitSchema
// create a habit schema
const createHabitSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
    category: z.string().max(100).optional(),
})

// update a habit schema
const updateHabitSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(),
    category: z.string().max(100).optional(),
})


const RespondRequestSchema = z.object({
    requestId: z.string().uuid(),
    action: z.enum(['ACCEPTED', 'REJECTED'])
})

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type RespondRequestInput = z.infer<typeof RespondRequestSchema>;

export {signupSchema, loginSchema, createHabitSchema, updateHabitSchema, RespondRequestSchema};