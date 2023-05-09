import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await clerkClient.users.getUser(ctx.auth.userId);

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const isUserAdmin = (user.privateMetadata.admin as boolean) ?? false;

    if (user) {
      return isUserAdmin;
    }
  }),
});
