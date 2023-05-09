import { Prisma } from "@prisma/client";

import { formSchema } from "~/components/AddQuestionCategoryForm";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const questionCategoryRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.questionCategory.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      });
    }
  }),
  add: protectedProcedure.input(formSchema).mutation(async ({ ctx, input }) => {
    try {
      const categoryData = {
        ...input,
      };

      await ctx.prisma.questionCategory.create({ data: categoryData });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Nu poti sa creezi inca o categoria cu aceelasi nume: "${input.name}"`,
          });
        }
      }
    }
  }),
});
