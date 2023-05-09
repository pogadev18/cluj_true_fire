import type { PropsWithChildren } from "react";

import Header from "./Header";
import { api } from "~/utils/api";
import { LoadingPage } from "./LoadingSpinner";

/*
TODO:
 - resolve question
 - answer from author (visible for everyone, on top somehow)
 - rate limit with upstash
 - questions pagination
*/

const PageLayout = (props: PropsWithChildren) => {
  const { data: isUserAdmin, isLoading: loadingUser } = api.user.get.useQuery();
  const { data: categories, isLoading: loadingCategories } =
    api.questionCategory.getAll.useQuery();

  if (loadingUser || loadingCategories) return <LoadingPage />;

  return (
    <main className="min-h-screen bg-gray-100 ">
      <section className="px-28 pt-4">
        <Header isUserAdmin={isUserAdmin} categories={categories} />
        <div className="content">{props.children}</div>
      </section>
    </main>
  );
};

export default PageLayout;
