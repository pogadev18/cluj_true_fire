import { clerkClient } from "@clerk/nextjs/server";

import { Prisma } from "@prisma/client";
import type { Question } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { formSchema } from "~/components/AddQuestionForm";

import { filterUserForClient } from "~/utils/filterUserForClient";

const addUserDataToQuestion = async (questions: Question[]) => {
  const userId = questions.map((question) => question.authorId);

  const users = (
    await clerkClient.users.getUserList({
      userId,
      limit: 110,
    })
  ).map(filterUserForClient);

  return questions.map((question) => {
    const author = users.find((user) => user.id === question.authorId);

    if (!author) {
      console.error("AUTHOR NOT FOUND", question);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Author for question not found. Question ID: ${question.id}, USER ID: ${question.authorId}`,
      });
    }

    // USE IF YOU CONNECT WITH EXTERNAL SERVICES (google, github, etc...)
    // if (!author.username) {
    //   // use the ExternalUsername
    //   if (!author.externalUsername) {
    //     throw new TRPCError({
    //       code: "INTERNAL_SERVER_ERROR",
    //       message: `Author has no GitHub Account: ${author.id}`,
    //     });
    //   }

    //   author.username = author.externalUsername;
    // }

    return {
      question,
      author: {
        ...author,
        email: author.email ?? "(email not found)",
      },
    };
  });
};

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
    const questions = await ctx.prisma.question.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    });

    return addUserDataToQuestion(questions);
  }),
});
