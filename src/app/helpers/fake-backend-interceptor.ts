import {Injectable} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {delay, dematerialize, materialize, mergeMap} from 'rxjs/operators';

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {

  constructor() {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let testUser = {id: 1, username: 'developer', password: 'admin', firstName: 'Test', lastName: 'User'};

    // wrap in delayed observable to simulate server api call
    return of(null).pipe(mergeMap(() => {

      // authenticate
      if (request.url.endsWith('https://gateway.tameemco.ir/uaa/oauth/token') && request.method === 'POST') {
        if (request.body.username === testUser.username && request.body.password === testUser.password) {
          // if login details are valid return 200 OK with a token
          return of(new HttpResponse({status: 200, body: {token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1MjcwMTAyMjIsInVzZXJfbmFtZSI6ImRldmVsb3BlciIsImF1dGhvcml0aWVzIjpbIlJPTEVfVVNFUiJdLCJqdGkiOiIxYzBhMjRjMS1lZGJlLTQ4YmYtYjZhZS1kZDY0YWEzY2EzNTciLCJjbGllbnRfaWQiOiJ3ZWJfYXBwIiwic2NvcGUiOlsib3BlbmlkIl19.PoygCSwxZsShaoEQYsoW55JpVSRQCf9-DFwgWFU8W2MTxfLgOiDk2M3IHJN969lPr-Qv6IalJQ58tzwxLuHVMlfyH4KFYAf94y3WsmO8DDUgOJnJNHDHe9d2t5Vhq8n6c3DZxfrXwBUrebMAwdzU3MBGQVpYAnFvmzXPKnfdBaRQfjXugzqIoY5ilZMD6dup444LI8cuaCAxAo1Jqf2Ilgadqdfdt_FNujeVGyroN6qKGu0L4zw57WACpydtTkyWk5fjBm4KEY2kn6lALKeu4agJKkkw-ERiKdfni3MHLmkKCcgRY4HuZUP-CYBpTjITiO0x8euCvS3FRCu9uATyaw'}}));
        } else {
          // else return 400 bad request
          return throwError('Username or password is incorrect');
        }
      }

      // get users
      if (request.url.endsWith('/api/users') && request.method === 'GET') {
        if (request.headers.get('Authorization') === 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJkZXZlbG9wZXIiLCJzY29wZSI6WyJvcGVuaWQiXSwiYXRpIjoiMWMwYTI0YzEtZWRiZS00OGJmLWI2YWUtZGQ2NGFhM2NhMzU3IiwiZXhwIjoxNTI5NTU5MDIyLCJhdXRob3JpdGllcyI6WyJST0xFX1VTRVIiXSwianRpIjoiNDZjM2UxMTctMDZjOS00OThkLWEwYWEtOWU4ODUyMDk2MzZmIiwiY2xpZW50X2lkIjoid2ViX2FwcCJ9.JpSGxBetxsWcA6H1yspW9pZiBCuWgaQEWJWfYbTTCu8sTFarU2i09VraNDm9mbrGpIodS3Xf1GGIeDoRCxi0rp1HCdNsOdqIKiDmiP6TJNH9rX5dgld-o2lE1a3o3onrKZiWXEzbatZzTjDf_SEU4XajucPOHrgnaN64W2F9IQPipMiuZ-Eo_L0Aif7IlsjyGKPT8HqmKX1a_RxvV6KLqBldlou3c9N85jDODvW_WWezKqZqU6GJqd6ZTMe1y0WuTzSadKBbwHJMltgsLIzObtzgSwq3LJcVcqzmATCqJwEH1C7RoedMAiXkOrMrQDwmcqUnCHV6Aw5o25BbbX1KkQ') {
          return of(new HttpResponse({status: 200, body: [testUser]}));
        } else {
          return throwError('Unauthorised');
        }
      }

      return next.handle(request);

    }))
      .pipe(materialize())
      .pipe(delay(500))
      .pipe(dematerialize());
  }
}

export let fakeBackendProvider = {
  // use fake backend in place of Http service for backend-less development
  provide: HTTP_INTERCEPTORS,
  useClass: FakeBackendInterceptor,
  multi: true
};
