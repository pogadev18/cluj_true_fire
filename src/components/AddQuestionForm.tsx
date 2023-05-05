import type { FC } from "react";
import type { SubmitHandler } from "react-hook-form/dist/types/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { LoadingSpinner } from "./LoadingSpinner";

export const formSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(40, "Title is too long (max 40 characters)"),
  details: z.string().max(255, "Description is too long").optional(),
});

export type FormData = z.infer<typeof formSchema>;

export type AddQuestionFormProps = {
  onSubmit: SubmitHandler<FormData>;
  mutationInProgress: boolean;
};

const AddQuestionForm: FC<AddQuestionFormProps> = ({
  mutationInProgress,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="form-control mb-5">
        <label htmlFor="title">Title</label>
        <input
          className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          type="text"
          {...register("title")}
          id="title"
        />
        {errors.title && (
          <p className="text-sm  text-red-600">{errors.title.message}</p>
        )}
      </div>
      <div className="form-control mb-5">
        <label htmlFor="details">Details (if you want)</label>
        <textarea
          {...register("details")}
          id="details"
          rows={5}
          className="block w-full resize-none rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.details && (
          <p className="text-sm  text-red-600">{errors.details.message}</p>
        )}
      </div>
      {mutationInProgress ? (
        <div className="my-4">
          <LoadingSpinner size={32} />
        </div>
      ) : (
        <button
          disabled={mutationInProgress}
          type="submit"
          className="my-4 rounded-lg bg-green-600 px-10 py-2.5 text-center text-sm font-medium text-white disabled:bg-slate-500"
        >
          Submit
        </button>
      )}
    </form>
  );
};

export default AddQuestionForm;
