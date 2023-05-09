import type { Answer, Question } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { formSchema } from "~/components/AddQuestionForm";

import { addUserDataToEntity } from "~/server/helpers/findUserInClerk";
import { z } from "zod";

const paginationSchema = z.object({
  limit: z.number().min(1).max(100).nullish(),
  cursor: z.string().nullish(),
});

const updateSchema = z.object({
  isSolved: z.boolean(),
  questionId: z.string(),
});

export const questionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(formSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const authorId = ctx.auth.userId;

        const clientCategories = input.categories?.map((cat) => ({
          name: cat,
        }));

        await ctx.prisma.question.create({
          data: {
            ...input,
            authorId,
            categories: {
              connect: [...clientCategories],
            },
          },
        });
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
  getAll: protectedProcedure
    .input(paginationSchema)
    .query(async ({ ctx, input }) => {
      try {
        const limit = input.limit ?? 10;
        const { cursor } = input;

        const questions = await ctx.prisma.question.findMany({
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          skip: 0,
          orderBy: { createdAt: "desc" },
          include: { categories: true },
        });

        let nextCursor: typeof cursor | undefined = undefined;

        if (questions.length > limit) {
          const nextQuestion = questions.pop();
          nextCursor = nextQuestion?.id;
        }

        // todo: try to find a better solution where to cast this (same as getById Query)
        const questionData = (await addUserDataToEntity(questions)).map(
          (question) => ({
            ...question,
            content: question.content as (typeof questions)[0],
          })
        );

        return {
          questions: questionData,
          nextCursor,
        };
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
        orderBy: { createdAt: "desc" },
      });

      if (!question)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No question found",
        });

      const questionAndUserData = (await addUserDataToEntity([question]))[0];
      const answerAndUserData = await addUserDataToEntity(answers);
      // todo: mabye try to cast this in `findUserInClert.ts`? - tried with typegurad function but not worked
      return {
        question: {
          ...questionAndUserData,
          content: questionAndUserData?.content as Question,
          isUserOwner: ctx.auth.userId === questionAndUserData?.author.id,
        },
        answers: answerAndUserData.map((answer) => {
          return {
            ...answer,
            content: answer?.content as Answer,
            isUserOwner: ctx.auth.userId === answer?.author.id,
          };
        }),
      };
    }),
  update: protectedProcedure
    .input(updateSchema)
    .mutation(async ({ ctx, input }) => {
      const { questionId, isSolved } = input;

      return await ctx.prisma.question.update({
        where: { id: questionId },
        data: { isSolved },
      });
    }),
});
