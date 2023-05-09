import type { FC } from "react";
import type { SubmitHandler } from "react-hook-form/dist/types/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { LoadingSpinner } from "./LoadingSpinner";

export const formSchema = z.object({
  name: z.string().nonempty("Adauga o categorie"),
});

export type FormData = z.infer<typeof formSchema>;

export type AddQuestionCategoryFormProps = {
  onSubmit: SubmitHandler<FormData>;
  mutationInProgress: boolean;
};

const AddQuestionCategoryForm: FC<AddQuestionCategoryFormProps> = ({
  mutationInProgress,
  onSubmit,
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="form-control mb-5">
        <label htmlFor="categorie">Categorie</label>
        <input
          className="block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          type="text"
          id="categorie"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm  text-red-600">{errors.name.message}</p>
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

export default AddQuestionCategoryForm;
