import z, { literal } from 'zod';

const FormFieldSchemaBase = z.strictObject({
  key: z.string(),
  label: z.string(),
});

const InputFieldSchema = FormFieldSchemaBase.extend({
  controlType: z.literal('text'),
  placeholder: z.string().optional(),
}).readonly();

const SelectFieldSchema = FormFieldSchemaBase.extend({
  controlType: literal('select'),
  options: z
    .array(
      z
        .strictObject({
          value: z.string().min(1),
          label: z.string().min(1),
        })
        .readonly(),
    )
    .nonempty()
    .readonly(),
}).readonly();

export const formFieldSchema = z.discriminatedUnion('controlType', [
  InputFieldSchema,
  SelectFieldSchema,
]);
export type MetaFormField = z.infer<typeof formFieldSchema>;
