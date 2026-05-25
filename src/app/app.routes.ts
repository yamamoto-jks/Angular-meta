import { Routes } from '@angular/router';
import { NotFound } from './not-found/not-found';
import { MetaForm } from './meta-form/meta-form';

export const routes: Routes = [
  {
    path: '',
    component: MetaForm,
  },
  {
    path: '**',
    component: NotFound,
  },
];
