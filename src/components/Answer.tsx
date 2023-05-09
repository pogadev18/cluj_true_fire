import type { FC } from "react";
import type { RouterOutputs } from "~/utils/api";

import Image from "next/image";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type QuestionWithAnswer =
  RouterOutputs["question"]["getById"]["answers"][number];

const Answer: FC<QuestionWithAnswer> = ({ author, content, isUserOwner }) => {
  console.log(content);
  return (
    <li key={content.id} className="mb-5">
      <figure
        className={`mx-auto rounded ${
          isUserOwner ? "bg-lime-400" : "bg-slate-200"
        } py-3 text-center shadow-sm`}
      >
        <svg
          aria-hidden="true"
          className="mx-auto mb-3 h-6 w-6 text-gray-400 dark:text-gray-600"
          viewBox="0 0 24 27"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z"
            fill="currentColor"
          />
        </svg>
        <blockquote>
          <p className="text-xl font-medium text-gray-900 ">
            {content.content}
          </p>
        </blockquote>
        <figcaption className="mt-2 flex items-center justify-center space-x-3">
          <Image
            className="h-6 w-6 rounded-full"
            width={6}
            height={6}
            src={author.profileImageUrl}
            alt={author.email}
          />
          <div className="flex items-center divide-x-2 divide-gray-500 dark:divide-gray-700">
            <cite className="pr-3 font-medium text-gray-900 ">
              {author.email} {isUserOwner && "(autor)"}
            </cite>
            <cite className="pl-3 text-sm text-gray-500 ">
              {dayjs(content.createdAt).fromNow()}
            </cite>
          </div>
        </figcaption>
      </figure>
    </li>
  );
};

export default Answer;
