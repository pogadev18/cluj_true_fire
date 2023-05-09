import Head from "next/head";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

import { api } from "~/utils/api";
import { META_TITLE } from "~/utils/constants";

import PageLayout from "~/components/PageLayout";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import SubmitAnswerForm from "~/components/SubmitAnswerForm";
import Answer from "~/components/Answer";

const SingeQuestionPage: NextPage = () => {
  // trpc cache context
  const ctx = api.useContext();

  const router = useRouter();
  const { id: questionId } = router.query;

  // render this client-side until fix with SSG or wait till nex13 release
  const { isLoading: loadingQuestion, data } = api.question.getById.useQuery(
    { id: questionId as string },
    { enabled: !!questionId }
  );

  const { mutate: submitAnswer, isLoading: submittingAnswer } =
    api.answer.add.useMutation({
      onSuccess: () => {
        toast.success("Answer successfully added");
        void ctx.question.getById.invalidate({ id: questionId as string });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  return (
    <>
      <Head>
        <title>{META_TITLE}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <section className="mt-5">
          {loadingQuestion ? (
            <LoadingSpinner />
          ) : (
            <section className="content-wrapper flex gap-10">
              <div className="left-side basis-4/12">
                <div className="title-wrapper mb-5">
                  {data?.question.isUserOwner && (
                    <div className="resolve-question mb-3">
                      <button className="font-bold uppercase underline">
                        Resolve
                      </button>
                    </div>
                  )}
                  <h1 className="text-3xl">{data?.question?.content.title} </h1>
                  {data?.question?.content.details && (
                    <>
                      <p>{data?.question?.content?.details}</p>
                    </>
                  )}
                  <p className="mt-3">
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Assumenda nulla perferendis vitae necessitatibus dolorum
                    omnis molestias doloremque, inventore quis magnam nam,
                    cumque sed quo magni sequi ipsam reiciendis cum recusandae!
                  </p>
                </div>
                <div className="answerForm">
                  <div className=" py-5">
                    <SubmitAnswerForm
                      mutationInProgress={submittingAnswer}
                      onSubmit={(data) =>
                        submitAnswer({
                          ...data,
                          questionId: questionId as string,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <aside className="right-side basis-8/12">
                <div className="answer-list h-screen border-l border-slate-400 pl-5">
                  <ul className="mt-5">
                    {data?.answers?.map((answer) => (
                      <Answer key={answer.content.id} {...answer} />
                    ))}
                  </ul>
                </div>
              </aside>
            </section>
          )}
        </section>
      </PageLayout>
    </>
  );
};

export default SingeQuestionPage;
