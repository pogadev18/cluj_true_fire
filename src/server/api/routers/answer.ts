import { formSchema } from "~/components/SubmitAnswerForm";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import * as z from "zod";
import { addUserDataToEntity } from "~/server/helpers/findUserInClerk";

import { Prisma } from "@prisma/client";
import { paginationSchema } from "./question";
import type { Answer } from "@prisma/client";

// connect question to answer using the "questionID" that is sent from the client
const questionIdSchema = z.object({
  questionId: z.string().nonempty("Question ID is required"),
});

const getAllAnswersSchema = paginationSchema.merge(questionIdSchema);

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
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: `Nu poti sa creezi un raspuns la fel cu: "${input.content}"`,
            });
          }
        }
      }
    }),
  // get all answers for a specific question
  getAll: protectedProcedure
    .input(getAllAnswersSchema)
    .query(async ({ ctx, input }) => {
      try {
        const limit = input.limit ?? 10;
        const { cursor } = input;

        const answers = await ctx.prisma.answer.findMany({
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          skip: 0,
          orderBy: { createdAt: "desc" },
          where: {
            questionId: input.questionId,
          },
        });

        const question = await ctx.prisma.question.findUnique({
          where: { id: input.questionId },
        });

        if (!question) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No question found",
          });
        }

        let nextCursor: typeof cursor | undefined = undefined;

        if (answers.length > limit) {
          const nextAnswer = answers.pop();
          nextCursor = nextAnswer?.id;
        }

        const answersData = (await addUserDataToEntity(answers)).map(
          (answer) => ({
            ...answer,
            content: answer.content as Answer,
            isUserOwner: answer?.author.id === question.authorId,
          })
        );

        return {
          answers: answersData,
          nextCursor,
        };
      } catch (e) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unfornately, we could not get the answer at this time.",
        });
      }
    }),
});
