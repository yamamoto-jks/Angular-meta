import { TestBed } from '@angular/core/testing';
import { MetaForm } from './meta-form';
import { META_FORM_FIELDS_TOKEN, MetaFormField } from './meta-form.model';
import { By } from '@angular/platform-browser';
import { MatOption } from '@angular/material/select';

describe('MetaForm - メタデータに基づいたUI表示', () => {
  const setupComponentsWith = async (meta: MetaFormField[]) => {
    await TestBed.configureTestingModule({
      imports: [MetaForm],
      providers: [{ provide: META_FORM_FIELDS_TOKEN, useValue: meta }],
    }).compileComponents();

    const fixture = TestBed.createComponent(MetaForm);
    const { debugElement } = fixture;

    return {
      fixture,
      debugElement,
    } as const;
  };

  // TODO: テストケース分割
  test('メタデータに基づき、input, selectのどちらも描画されること', async () => {
    const { fixture, debugElement } = await setupComponentsWith([
      {
        controlType: 'text',
        label: 'テスト入力',
        key: 'test-text',
      },
      {
        controlType: 'select',
        label: 'テスト選択',
        key: 'test-select',
        options: [
          {
            label: 'テスト選択肢A',
            value: 'test-option-a',
          },
          {
            label: 'テスト選択肢B',
            value: 'test-option-b',
          },
        ],
      },
    ]);
    fixture.detectChanges();

    // TODO: matへの依存をなくすこと（どのUIライブラリでも動くように、ふるまいだけテストする）
    const formFields = debugElement.queryAll(By.css('mat-form-field'));
    expect(formFields.length).toBe(2);

    const [inputField, selectField] = formFields;
    const input = inputField.query(By.css('input[mat-input]'));
    const select = selectField.query(By.css('mat-select'));
    expect(input).toBeDefined();
    expect(select).toBeDefined();

    const inputLabel = inputField.query(By.css('mat-label'));
    const selectLabel = selectField.query(By.css('mat-label'));
    expect((inputLabel.nativeElement as HTMLElement).textContent.trim()).toBe('テスト入力');
    expect((selectLabel.nativeElement as HTMLElement).textContent.trim()).toBe('テスト選択');

    (select.nativeElement as HTMLSelectElement).click();
    fixture.detectChanges();

    const options = selectField.queryAll(By.css('mat-option'));
    expect(options.length).toBe(2);
    const [firstOption, secondOption] = options;
    expect((firstOption.nativeElement as HTMLOptionElement).textContent.trim()).toBe(
      'テスト選択肢A',
    );
    expect((secondOption.nativeElement as HTMLOptionElement).textContent.trim()).toBe(
      'テスト選択肢B',
    );
    expect((firstOption.componentInstance as MatOption).value).toBe('test-option-a');
    expect((secondOption.componentInstance as MatOption).value).toBe('test-option-b');
  });
});
