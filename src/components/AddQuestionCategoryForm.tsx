import type { FC } from "react";
import type { SubmitHandler } from "react-hook-form/dist/types/form";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "react-select";

import { LoadingSpinner } from "./LoadingSpinner";

import { categories } from "~/utils/constants";

export const formSchema = z.object({
  categories: z
    .array(z.string(), { required_error: "Selecteaza minim o categorie" })
    .nonempty("Selecteaza minim o categorie"),
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
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  return (
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="form-control mb-5">
        <label htmlFor="categories">Categorie</label>
        <Controller
          name="categories"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={categories}
              value={categories.filter((c) =>
                (field.value || []).includes(c.value)
              )}
              isMulti
              placeholder="Selecteaza categoriile"
              onChange={(values) => field.onChange(values.map((v) => v.value))}
            />
          )}
        />
        {errors.categories && (
          <p className="text-sm  text-red-600">{errors.categories.message}</p>
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
