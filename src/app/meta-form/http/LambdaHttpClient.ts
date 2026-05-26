import { inject } from '@angular/core';
import { formFieldSchema, MetaFormField } from '../meta-form.model';
import { FormId, formIdSchema, HttpClient as MetaformHttpClient } from './HttpClient';
import { HttpClient } from '@angular/common/http';
import z from 'zod';
import { map, Observable } from 'rxjs';
import { InvalidStatusCodeException } from './exceptions/InvalidStatusCodeException';

const LambdaRawResponseSchema = z.object({
  statusCode: z.number(),
  body: z.string(),
});

const DynamoDbItemSchema = z.strictObject({
  formId: formIdSchema,
  fields: z.array(formFieldSchema),
});

const runtimeResponseToFormFields = (raw: unknown): MetaFormField[] => {
  const validatedResponse = LambdaRawResponseSchema.parse(raw);
  if (validatedResponse.statusCode < 200 || 300 <= validatedResponse.statusCode) {
    throw new InvalidStatusCodeException(
      `失敗ステータスが返却されました。 > ${validatedResponse.statusCode}`,
    );
  }

  const parsedBody = JSON.parse(validatedResponse.body);
  const validatedData = DynamoDbItemSchema.parse(parsedBody);
  return validatedData.fields;
};

export class LambdaHttpClient implements MetaformHttpClient {
  private static readonly API_URL = '/2015-03-31/functions/function/invocations';
  private readonly http = inject(HttpClient);

  getFormMetadata(formId: FormId): Observable<MetaFormField[]> {
    return this.http
      .post(LambdaHttpClient.API_URL, {
        queryStringParameters: { formId },
      })
      .pipe(map((raw) => runtimeResponseToFormFields(raw)));
  }
}
