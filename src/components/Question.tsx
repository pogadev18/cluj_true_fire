import type { FC } from "react";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

type QuestionWithUser = RouterOutputs["question"]["getAll"][number];

const Question: FC<QuestionWithUser> = ({ author, content }) => {
  return (
    <li
      key={content.id}
      className="flex flex-grow items-center justify-between border-b border-slate-300 p-4 py-8"
    >
      <div className="image-and-title-wrapper flex gap-3">
        <Image
          src={author.profileImageUrl}
          className="h-14 w-14 rounded-full"
          alt={`@${author.email}'s profile picture`}
          width={56}
          height={56}
        />
        <div className="flex flex-col">
          <div className="flex gap-1 text-slate-500">
            <Link href={`/@${author.email}`}>
              <span>{`@${author.email} `}</span>
            </Link>
            <span className="font-thin">{` · ${dayjs(
              content.createdAt
            ).fromNow()}`}</span>
          </div>
          <span className="text-2xl">
            <Link href={`/question/${content.id}`}>{content.title}</Link>
          </span>
        </div>
      </div>
      <div
        className={`question-status rounded-md p-3 py-1 ${
          content.isSolved ? "bg-green-600" : "bg-red-500"
        }  text-white`}
      >
        {content.isSolved ? "solved" : "unresolved"}
      </div>
    </li>
  );
};

export default Question;
