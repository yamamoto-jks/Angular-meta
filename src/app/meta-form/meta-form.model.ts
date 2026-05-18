import { InjectionToken } from '@angular/core';
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
  options: z.array(
    z
      .strictObject({
        value: z.string().min(1),
        label: z.string().min(1),
      })
      .readonly(),
  ),
}).readonly();

const formFieldSchema = z.discriminatedUnion('controlType', [InputFieldSchema, SelectFieldSchema]);

export type MetaFormField = z.infer<typeof formFieldSchema>;
export const META_FORM_FIELDS_TOKEN = new InjectionToken<MetaFormField[]>('META_FORM_FIELDS');
export const META_FORM_FIELDS: MetaFormField[] = [
  {
    key: 'userName',
    label: 'ユーザー名',
    controlType: 'text',
    placeholder: '例: 田中太郎',
  },
  {
    key: 'bloodType',
    label: '血液型',
    controlType: 'select',
    options: [
      { value: 'A', label: 'A型' },
      { value: 'B', label: 'B型' },
      { value: 'O', label: 'O型' },
      { value: 'AB', label: 'AB型' },
    ],
  },
] as const;
