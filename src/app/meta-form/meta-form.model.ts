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
    .readonly()
    .refine(
      (options) => {
        const values = options.map(({ value }) => value);
        const isValueDuplicated = new Set(values).size === values.length;
        return isValueDuplicated;
      },
      { error: 'options 内で value が重複しています。' },
    )
    .refine(
      (options) => {
        const labels = options.map(({ label }) => label);
        const isLabelDuplicated = new Set(labels).size === labels.length;
        return isLabelDuplicated;
      },
      { error: 'options 内で label が重複しています。' },
    ),
}).readonly();

export const formFieldSchema = z.discriminatedUnion('controlType', [
  InputFieldSchema,
  SelectFieldSchema,
]);
export type MetaFormField = z.infer<typeof formFieldSchema>;
