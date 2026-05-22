import { Routes } from '@angular/router';
import { NotFound } from './not-found/not-found';
import { MetaForm } from './meta-form/meta-form';
import { META_FORM_FIELDS, META_FORM_FIELDS_TOKEN } from './meta-form/meta-form.model';

export const routes: Routes = [
  {
    path: '',
    component: MetaForm,
    providers: [
      {
        provide: META_FORM_FIELDS_TOKEN,
        useValue: META_FORM_FIELDS,
      },
    ],
  },
  {
    path: '**',
    component: NotFound,
  },
];
