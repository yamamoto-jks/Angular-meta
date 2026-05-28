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
  private static readonly API_URL = {
    LOCAL: '/lambda',
    PROD: 'https://bxfjpizdji.execute-api.ap-northeast-1.amazonaws.com/prod',
  } as const;
  private readonly http = inject(HttpClient);

  submit(keyAndValues: Record<MetaFormField['key'], string>) {
    if (environment.production) {
      this.submitOnProd(keyAndValues);
    } else {
      this.submitOnLocal(keyAndValues);
    }
  }

  private submitOnLocal(keyAndValues: Record<MetaFormField['key'], string>) {
    this.http
      .post(`${LambdaHttpClient.API_URL.LOCAL}/save-answer`, {
        queryStringParameters: { answers: JSON.stringify(keyAndValues) },
      })
      .subscribe();
  }

  private submitOnProd(keyAndValues: Record<MetaFormField['key'], string>) {
    this.http
      .post(`${LambdaHttpClient.API_URL.PROD}/answer`, {
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
      .post(`${LambdaHttpClient.API_URL.LOCAL}/get-metadata`, {
        queryStringParameters: { formId },
      })
      .pipe(map((raw) => runtimeResponseToFormFields(raw)));
  }

  private getFromMetadataInProd(formId: FormId): Observable<MetaFormField[]> {
    return this.http
      .get(`${LambdaHttpClient.API_URL.PROD}/metadata?formId=${formId}`)
      .pipe(map((raw) => DynamoDbItemSchema.parse(raw)['fields']));
  }
}
