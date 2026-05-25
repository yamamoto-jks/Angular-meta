import { inject, Injectable } from '@angular/core';
import { HttpClient, META_HTTP_CLIENT_TOKEN } from './http/HttpClient';

@Injectable({ providedIn: 'root' })
export class MetaFormService {
  private readonly http = inject<HttpClient>(META_HTTP_CLIENT_TOKEN);

  getFormMetadata() {
    return this.http.getFormMetadata('user_profile');
  }
}
