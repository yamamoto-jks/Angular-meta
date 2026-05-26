import { Observable } from 'rxjs';
import { MetaFormField } from '../meta-form.model';
import { InjectionToken } from '@angular/core';
import z from 'zod';

export const formIdSchema = z.literal('user_profile');
export type FormId = z.infer<typeof formIdSchema>;
export const META_HTTP_CLIENT_TOKEN = new InjectionToken<HttpClient[]>('META_HTTP_CLIENT');

export interface HttpClient {
  getFormMetadata(formId: FormId): Observable<MetaFormField[]>;
}
