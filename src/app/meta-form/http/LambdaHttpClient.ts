import { inject } from '@angular/core';
import { formFieldSchema, MetaFormField } from '../meta-form.model';
import { FormId, formIdSchema, HttpClient as MetaformHttpClient } from './HttpClient';
import { HttpClient } from '@angular/common/http';
import z from 'zod';
import { map, Observable } from 'rxjs';
import { InvalidStatusCodeException } from './exceptions/InvalidStatusCodeException';
import { environment } from '../../../environments/environment';

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
  private readonly http = inject(HttpClient);

  submit(keyAndValues: Record<MetaFormField['key'], string>) {
    this.http
      .post('/2015-03-31/functions/save-answer/invocations', {
        queryStringParameters: { answers: JSON.stringify(keyAndValues) },
      })
      .subscribe();
  }

  getFormMetadata(formId: FormId): Observable<MetaFormField[]> {
    return environment.production
      ? this.getFromMetadataInProd(formId)
      : this.getFromMetadataInLocal(formId);
  }

  private getFromMetadataInLocal(formId: FormId): Observable<MetaFormField[]> {
    return this.http
      .post('/2015-03-31/functions/get-metadata/invocations', {
        queryStringParameters: { formId },
      })
      .pipe(map((raw) => runtimeResponseToFormFields(raw)));
  }

  private getFromMetadataInProd(formId: FormId): Observable<MetaFormField[]> {
    return this.http
      .get(
        `https://bxfjpizdji.execute-api.ap-northeast-1.amazonaws.com/prod/metadata?formId=${formId}`,
      )
      .pipe(map((raw) => DynamoDbItemSchema.parse(raw)['fields']));
  }
}
