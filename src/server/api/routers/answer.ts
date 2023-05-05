import { formSchema } from "~/components/SubmitAnswerForm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const answerRouter = createTRPCRouter({
  create: protectedProcedure
    .input(formSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const authorId = ctx.auth.userId;
        const answerData = {
          ...input,
          authorId,
        };

        await ctx.prisma.answer.create({ data: answerData });
      } catch (e) {
        console.error(e);
      }
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.prisma.answer.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unfornately, we could not get the questions at this time.",
      });
    }
  }),
});
