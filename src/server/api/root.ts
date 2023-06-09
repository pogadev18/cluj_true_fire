import { createTRPCRouter } from "~/server/api/trpc";
import { questionRouter } from "./routers/question";
import { answerRouter } from "./routers/answer";
import { userRouter } from "./routers/user";
import { questionCategoryRouter } from "./routers/questionCategory";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  question: questionRouter,
  answer: answerRouter,
  user: userRouter,
  questionCategory: questionCategoryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
