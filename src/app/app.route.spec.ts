import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { RouterTestingHarness } from '@angular/router/testing';
import { MetaForm } from './meta-form/meta-form';
import { NotFound } from './not-found/not-found';

describe('ルーティング', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
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
