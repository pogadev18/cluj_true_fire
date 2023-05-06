import { clerkClient } from "@clerk/nextjs/server";
import { filterUserForClient } from "./filterUserForClient";
import type { Answer, Question } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const findUsersInClerk = async (userId: string[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId,
      limit: 110,
    })
  ).map(filterUserForClient);

  return users;
};

// Attach the user info from Clerk to either Question or Answer
type Entity = Question[] | Answer[];
export const addUserDataToEntity = async (entity: Entity) => {
  const userId = entity.map((data) => data.authorId);

  const users = await findUsersInClerk(userId);

  return entity.map((data) => {
    const author = users.find((user) => user.id === data.authorId);

    if (!author) {
      console.error("AUTHOR NOT FOUND", data);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Author for question not found. Question ID: ${data.id}, USER ID: ${data.authorId}`,
      });
    }

    return {
      content: data,
      author: {
        ...author,
        email: author.email ?? "(email not found)",
      },
    };
  });
};
