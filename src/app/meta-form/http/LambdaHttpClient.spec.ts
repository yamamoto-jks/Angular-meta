import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LambdaHttpClient } from './LambdaHttpClient';
import { InvalidStatusCodeException } from './exceptions/InvalidStatusCodeException';
import { MetaFormField } from '../meta-form.model';

describe('AWS Lambda経由のフォームのメタデータ取得', () => {
  let service: LambdaHttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LambdaHttpClient, provideHttpClientTesting()],
    });

    service = TestBed.inject(LambdaHttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('正常系', () => {
    test('正しいエンドポイントへアクセスされること', () => {
      service.getFormMetadata('user_profile').subscribe();

      httpMock.expectOne('/2015-03-31/functions/function/invocations');
    });

    test('レスポンス', () => {
      const dummyResponse = {
        statusCode: 200,
        body: JSON.stringify({
          formId: 'user_profile',
          fields: [
            {
              key: 'name',
              label: '名前',
              controlType: 'text',
            },
            {
              key: 'bloodType',
              label: '血液型',
              controlType: 'select',
              options: [
                {
                  label: 'A型',
                  value: 'A',
                },
                {
                  label: 'B型',
                  value: 'B',
                },
                {
                  label: 'O型',
                  value: 'O',
                },
                {
                  label: 'AB型',
                  value: 'AB',
                },
              ],
            },
          ] as MetaFormField[],
        }),
      };

      service.getFormMetadata('user_profile').subscribe({
        next: (fields) => {
          expect(fields.length).toBe(2);
          const [firstField, secondField] = fields;
          expect(firstField.key).toBe('name');
          expect(secondField.key).toBe('bloodType');
          if (secondField.controlType !== 'select') {
            throw new Error();
          }
          expect(secondField.options.length).toBe(4);
        },
      });

      const req = httpMock.expectOne('/2015-03-31/functions/function/invocations');
      req.flush(dummyResponse);
    });
  });

  describe('異常系', () => {
    test('レスポンスのステータスコードが2xxでない際、例外が送出されること', () => {
      const invalidStatusCodeResponse = {
        statusCode: 500,
        body: JSON.stringify({
          message: 'エラーが発生しました。',
        }),
      };

      service.getFormMetadata('user_profile').subscribe({
        error: (error) => expect(error).instanceOf(InvalidStatusCodeException),
      });

      const req = httpMock.expectOne('/2015-03-31/functions/function/invocations');
      req.flush(invalidStatusCodeResponse);
    });
  });
});
