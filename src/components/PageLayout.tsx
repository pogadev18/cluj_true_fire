import type { PropsWithChildren } from "react";

import Header from "./Header";

const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="min-h-screen bg-gray-100 ">
      <section className="px-28 pt-4">
        <Header />
        <div className="content">{props.children}</div>
      </section>
    </main>
  );
};

export default PageLayout;
