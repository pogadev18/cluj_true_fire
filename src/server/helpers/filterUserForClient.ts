import type { User } from "@clerk/nextjs/dist/api";
export const filterUserForClient = (user: User) => {
  // USE IF YOU CONNECT WITH EXTERNAL SERVICES (google, github, etc...)
  // return {
  //   id: user.id,
  //   username: user.username,
  //   email: user?.emailAddresses[0]?.emailAddress ?? null,
  //   profileImageUrl: user.profileImageUrl,
  //   externalUsername:
  //     user.externalAccounts.find(
  //       (externalAccount) => externalAccount.provider === "oauth_github"
  //     )?.username || null,
  // };

  return {
    id: user.id,
    email: user?.emailAddresses[0]?.emailAddress ?? null,
    profileImageUrl: user.profileImageUrl,
  };
};
