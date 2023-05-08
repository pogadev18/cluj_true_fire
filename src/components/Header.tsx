import { useState } from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import Link from "next/link";

import Modal from "./Modal";
import AddQuestionForm from "./AddQuestionForm";

import { api } from "~/utils/api";

const Header = () => {
  const [openQuestionModal, setOpenQuestionModal] = useState(false);
  const { data: user, isLoading: loadingUser } = api.user.get.useQuery();

  // trpc cache context
  const ctx = api.useContext();
  const { mutate: saveQuestion, isLoading: isSavingQuestion } =
    api.question.create.useMutation({
      onSuccess: () => {
        toast.success("Question successfully added");
        setOpenQuestionModal(false);
        void ctx.question.getAll.invalidate();
      },
      onError: (e) => toast(e.message),
    });

  if (loadingUser) return null;

  return (
    <header className="flex h-12 items-center justify-between rounded border-b border-slate-300 px-4 py-8">
      <h1 className="text-xl font-bold uppercase">
        <Link href="/">Cluj True Fire</Link>
      </h1>
      <div className="flex items-center gap-5">
        <button
          className="color-black rounded bg-yellow-400 px-4 py-2 transition-all hover:bg-yellow-500"
          onClick={() => setOpenQuestionModal(true)}
        >
          Add Question
        </button>
        {user?.isAdmin && (
          <button
            className="color-black rounded bg-slate-400 px-4 py-2 text-white transition-all hover:bg-slate-500"
            onClick={() => setOpenQuestionModal(true)}
          >
            Add Question Category
          </button>
        )}
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
      <Modal
        title="Submit your question"
        description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint nam
        eligendi quia met consectetur adipisicing?"
        open={openQuestionModal}
        setOpen={setOpenQuestionModal}
      >
        <AddQuestionForm
          mutationInProgress={isSavingQuestion}
          onSubmit={(data) => saveQuestion(data)}
        />
      </Modal>
    </header>
  );
};

export default Header;
