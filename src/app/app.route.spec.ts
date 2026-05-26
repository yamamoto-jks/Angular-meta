import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { RouterTestingHarness } from '@angular/router/testing';
import { MetaForm } from './meta-form/meta-form';
import { NotFound } from './not-found/not-found';
import { HttpClient, META_HTTP_CLIENT_TOKEN } from './meta-form/http/HttpClient';
import { of } from 'rxjs';

describe('ルーティング', () => {
  beforeEach(() => {
    const mockMetaHttpClient: HttpClient = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getFormMetadata(_formId) {
        return of([]);
      },
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        { provide: META_HTTP_CLIENT_TOKEN, useValue: mockMetaHttpClient },
      ],
    });
  });

  test('ルートURLへアクセスした際、フォームが表示されること', async () => {
    const harness = await RouterTestingHarness.create();

    const page = await harness.navigateByUrl('', MetaForm);

    expect(page).toBeInstanceOf(MetaForm);
  });

  test('不正なURLへアクセスした際、NotFoundページへ飛ばされること', async () => {
    const harness = await RouterTestingHarness.create();

    const page = await harness.navigateByUrl('dummy-url', NotFound);

    expect(page).toBeInstanceOf(NotFound);
  });
});
