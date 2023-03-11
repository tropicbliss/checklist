import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const taskRouter = createTRPCRouter({
    createTask: protectedProcedure.input(
        z.object({
            title: z.string(),
            priority: z.boolean(),
            dueAt: z.date(),
        })
    ).mutation(async ({ ctx, input }) => {
        try {
            return await ctx.prisma.task.create({
                data: {
                    dueAt: input.dueAt,
                    priority: input.priority,
                    title: input.title,
                    userId: ctx.session.user.id
                },
            });
        } catch (e) {
            console.error(e)
        }
    }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
        try {
            return await ctx.prisma.task.findMany({
                select: {
                    id: true,
                    dueAt: true,
                    priority: true,
                    title: true
                },
                where: {
                    userId: ctx.session.user.id
                },
                orderBy: [
                    { priority: "desc" }, { dueAt: "asc" }
                ]
            })
        } catch (error) {
            console.error(error)
        }
    }),
    updatePriority: protectedProcedure.input(
        z.object({
            id: z.string().uuid(),
            priority: z.boolean()
        })
    ).mutation(async ({ ctx, input }) => {
        try {
            await ctx.prisma.task.update({
                data: {
                    priority: input.priority
                },
                where: {
                    id: input.id
                }
            })
        } catch (error) {
            console.error(error)
        }
    }),
    deleteTask: protectedProcedure.input(
        z.object({
            id: z.string().uuid()
        })
    ).mutation(async ({ ctx, input }) => {
        try {
            await ctx.prisma.task.delete({
                where: {
                    id: input.id
                }
            })
        } catch (error) {
            console.error(error)
        }
    })
})