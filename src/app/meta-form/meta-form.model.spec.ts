import { ZodError } from 'zod';
import { formFieldSchema, MetaFormField } from './meta-form.model';

describe('フォームのメタデータ', () => {
  describe('スキーマが正しく設定されているか', () => {
    describe('正常', () => {
      describe('controlTypeがtextのとき', () => {
        test('プレースホルダありのとき', () => {
          const inputWithPlaceHolder: Extract<MetaFormField, { controlType: 'text' }> = {
            key: 'input',
            label: 'プレースホルダあり',
            controlType: 'text',
            placeholder: 'テストプレースホルダ',
          };

          expect(() => {
            formFieldSchema.parse(inputWithPlaceHolder);
          }).not.toThrow();
        });

        test('プレースホルダなしのとき', () => {
          const inputWithoutPlaceholder: Extract<MetaFormField, { controlType: 'text' }> = {
            key: 'input',
            label: 'プレースホルダなし',
            controlType: 'text',
          };

          expect(() => {
            formFieldSchema.parse(inputWithoutPlaceholder);
          }).not.toThrow();
        });
      });

      describe('controlTypeがselectのとき', () => {
        test('optionsが1つのとき', () => {
          const selectWithOneOption: Extract<MetaFormField, { controlType: 'select' }> = {
            key: 'select',
            label: 'テストラベル',
            controlType: 'select',
            options: [
              {
                value: 'test-option',
                label: 'テスト選択肢',
              },
            ],
          };

          expect(() => {
            formFieldSchema.parse(selectWithOneOption);
          }).not.toThrow();
        });

        test('optionsが複数ある時', () => {
          const selectWithMultipleOptions: Extract<MetaFormField, { controlType: 'select' }> = {
            key: 'select',
            label: 'テストラベル',
            controlType: 'select',
            options: [
              {
                value: 'test-option',
                label: 'テスト選択肢',
              },
              {
                value: 'test-option2',
                label: 'テスト選択肢2',
              },
              {
                value: 'test-option3',
                label: 'テスト選択肢3',
              },
            ],
          };

          expect(() => {
            formFieldSchema.parse(selectWithMultipleOptions);
          }).not.toThrow();
        });
      });
    });

    describe('準正常', () => {
      describe('controlTypeがtextのとき', () => {
        test('controlTypeがtextにかかわらずoptionsが設定されている場合、例外が送出されること', () => {
          const inputWithOptions = {
            key: 'input-with-options',
            label: 'inputとoptionsが設定されているケース',
            controlType: 'text',
            options: [
              {
                value: 'dummy-option',
                label: 'ダミー選択肢',
              },
            ],
          };

          expect(() => {
            formFieldSchema.parse(inputWithOptions);
          }).toThrow(/Unrecognized key.*options/);
        });
      });

      describe('controlTypeがselectのとき', () => {
        test('optionsが未設定であるcontrolTypeがselectの場合、例外が送出されること', () => {
          const selectWithNoOptions: Extract<MetaFormField, { controlType: 'select' }> = {
            key: 'select',
            label: 'テストラベル',
            controlType: 'select',
            options: [],
          };

          expect(() => {
            formFieldSchema.parse(selectWithNoOptions);
          }).toThrow(/Too small*/);
        });

        test('optionsのlabelに重複が発生しているとき、例外が送出されること', () => {
          const selectWithDuplicatedLabelOptions: Extract<
            MetaFormField,
            { controlType: 'select' }
          > = {
            key: 'select',
            label: 'テストラベル',
            controlType: 'select',
            options: [
              {
                label: 'テストラベル',
                value: 'test',
              },
              {
                label: 'テストラベル',
                value: 'test2',
              },
            ],
          };

          expect(() => {
            formFieldSchema.parse(selectWithDuplicatedLabelOptions);
          }).toThrow(ZodError);
        });
      });
    });
  });
});
