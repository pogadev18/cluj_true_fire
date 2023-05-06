import { formSchema } from "~/components/SubmitAnswerForm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import * as z from "zod";

// connect question to answer using the "questionID" that is sent from the client
const questionIdSchema = z.object({
  questionId: z.string().nonempty("Question ID is required"),
});
const addAnswerSchema = formSchema.merge(questionIdSchema);

export const answerRouter = createTRPCRouter({
  add: protectedProcedure
    .input(addAnswerSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const authorId = ctx.auth.userId;
        const answerData = {
          ...input,
          authorId,
        };

        await ctx.prisma.answer.create({ data: answerData });
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unfornately, we could not add your answer at this time.",
        });
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
