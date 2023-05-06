import Head from "next/head";
import type { NextPage } from "next";
import { useUser } from "@clerk/clerk-react";
import { useRouter } from "next/router";

import { api } from "~/utils/api";
import { META_TITLE } from "~/utils/constants";

import PageLayout from "~/components/PageLayout";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import SubmitAnswerForm from "~/components/SubmitAnswerForm";
import { toast } from "react-hot-toast";

const SingeQuestionPage: NextPage = () => {
  const router = useRouter();
  const { id: questionId } = router.query;

  // render this client-side until fix with SSG or wait till nex13 release
  const { user } = useUser();
  const { isLoading: loadingQuestion, data: question } =
    api.question.getById.useQuery(
      { id: questionId as string },
      { enabled: !!questionId }
    );

  const { mutate: submitAnswer, isLoading: submittingAnswer } =
    api.answer.add.useMutation({
      onSuccess: () => {
        toast.success("Answer successfully added");
      },
    });

  const isUserQuestionOwner = user?.id === question?.content.authorId;

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
            <div className="flex items-center justify-between">
              <div className="question-wrapper flex-grow">
                <h1 className="mb-5 text-3xl">{question?.content.title}</h1>
                <div className="answerFormAndAnswerListWrapper flex justify-between">
                  <div className="answerForm w-1/2 ">
                    {question?.content.details && (
                      <p>{question?.content?.details}</p>
                    )}
                    {!isUserQuestionOwner && (
                      <div>
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
                    )}
                  </div>
                  <div className="answer-list">
                    <p>answers...</p>
                  </div>
                </div>
              </div>
              {isUserQuestionOwner && (
                <div className="resolve-question">
                  <button className="rounded-md  p-4 font-bold underline">
                    Resolve
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </PageLayout>
    </>
  );
};

export default SingeQuestionPage;
