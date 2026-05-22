import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { META_FORM_FIELDS_TOKEN, MetaFormField } from './meta-form.model';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-meta-form',
  imports: [MatFormFieldModule, FormsModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './meta-form.html',
  styleUrl: './meta-form.scss',
})
export class MetaForm {
  readonly metaFormFields = inject<MetaFormField[]>(META_FORM_FIELDS_TOKEN);
  readonly values = signal(MetaForm.initialFieldKeyAndValues(this.metaFormFields));
  readonly errors = signal(MetaForm.initialFieldKeyAndValues(this.metaFormFields));

  private static initialFieldKeyAndValues(metaFormFields: MetaFormField[]) {
    const val: Record<MetaFormField['key'], string> = {};

    for (const { key } of metaFormFields) {
      val[key] = '';
    }

    return val;
  }

  onSubmit() {
    this.errors.set(this.errorsFromValues());

    if (Object.values(this.errors()).some((error) => error)) {
      return;
    }

    console.log('送信', this.values());
  }

  updateValue(key: string, newValue: string) {
    this.values.update((val) => ({
      ...val,
      [key]: newValue,
    }));
  }

  private errorsFromValues() {
    const errors: Record<string, string> = {};
    Object.entries(this.values()).forEach(([key, value]) => {
      if (value === '') {
        errors[key] = '入力してください。';
        return;
      }

      errors[key] = '';
    });

    return errors;
  }
}
