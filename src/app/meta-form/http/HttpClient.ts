import { Observable } from 'rxjs';
import { MetaFormField } from '../meta-form.model';
import { InjectionToken } from '@angular/core';

export type FormId = 'user_profile';
export const META_HTTP_CLIENT_TOKEN = new InjectionToken<HttpClient[]>('META_HTTP_CLIENT');

export interface HttpClient {
  getFormMetadata(formId: FormId): Observable<MetaFormField[]>;
}
