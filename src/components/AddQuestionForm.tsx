import type { FC } from "react";
import type { SubmitHandler } from "react-hook-form/dist/types/form";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Select from "react-select";

import { LoadingSpinner } from "./LoadingSpinner";

export const formSchema = z.object({
  title: z
    .string()
    .min(10, "Titlul intrebarii este obligatoriu (min 20 caractere)"),
  categories: z
    .array(z.string(), { required_error: "Selecteaza minim o categorie" })
    .nonempty("Selecteaza minim o categorie"),
  details: z
    .string()
    .optional()
    .refine((details) => !details || details.length >= 50, {
      message: "Descrierea este prea scruta (minim 50 de caractere)",
    }),
});

export type FormData = z.infer<typeof formSchema>;

export type AddQuestionFormProps = {
  categories: { label: string; value: string }[] | undefined;
  onSubmit: SubmitHandler<FormData>;
  mutationInProgress: boolean;
};

const AddQuestionForm: FC<AddQuestionFormProps> = ({
  mutationInProgress,
  onSubmit,
  categories,
}) => {
  const {
    control,
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
        <label htmlFor="title">Titlu</label>
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
        <label htmlFor="categories">Categorie</label>
        <Controller
          name="categories"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={categories}
              value={categories?.filter((c) =>
                (field.value || []).includes(c.label)
              )}
              isMulti
              placeholder="Selecteaza categoriile"
              onChange={(values) => field.onChange(values.map((v) => v.label))}
            />
          )}
        />
        {errors.categories && (
          <p className="text-sm  text-red-600">{errors.categories.message}</p>
        )}
      </div>
      <div className="form-control mb-5">
        <label htmlFor="details">Detalii (daca doresti)</label>
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
