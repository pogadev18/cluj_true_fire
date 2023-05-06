import { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { formSchema } from "~/components/AddQuestionForm";

import { addUserDataToEntity } from "~/server/helpers/findUserInClerk";
import { z } from "zod";

export const questionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(formSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const authorId = ctx.auth.userId;

        const questionData = {
          ...input,
          authorId,
        };

        await ctx.prisma.question.create({ data: questionData });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: `You cannot create another question with the same title: "${input.title}"`,
            });
          }
        }
      }
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const questions = await ctx.prisma.question.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
      });

      return addUserDataToEntity(questions);
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unfornately, we could not get the questions at this time.",
      });
    }
  }),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const question = await ctx.prisma.question.findUnique({
        where: { id: input.id },
      });

      // grab all the answers related to this question and send them to client
      const answers = await ctx.prisma.answer.findMany({
        where: { questionId: input.id },
      });
      console.log("answers!!! >>>", answers);

      if (!question)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No question found",
        });

      const questionAndUserData = (await addUserDataToEntity([question]))[0];
      const answerAndUserData = await addUserDataToEntity(answers);
      console.log("questionAndUserData", questionAndUserData);
      console.log("answerAndUserData", answerAndUserData);
      return (await addUserDataToEntity([question]))[0];
    }),
});
