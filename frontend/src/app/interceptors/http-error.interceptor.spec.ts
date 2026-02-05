import { TestBed } from '@angular/core/testing';
import { HttpErrorInterceptor } from './http-error.interceptor';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';

describe('HttpErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: HttpErrorInterceptor,
          multi: true,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should pass through successful requests', () => {
    const testData = { message: 'success' };

    httpClient.get('/test').subscribe((data) => {
      expect(data).toEqual(testData);
    });

    const req = httpMock.expectOne('/test');
    req.flush(testData);
  });

  it('should handle 404 error', () => {
    httpClient.get('/test').subscribe({
      error: (error) => {
        expect(error.message).toContain('non trouvée');
      },
    });

    // First request (original)
    const req1 = httpMock.expectOne('/test');
    req1.flush('Not Found', { status: 404, statusText: 'Not Found' });
    
    // Retry request
    const req2 = httpMock.expectOne('/test');
    req2.flush('Not Found', { status: 404, statusText: 'Not Found' });
  });

  it('should handle 500 error', () => {
    httpClient.get('/test').subscribe({
      error: (error) => {
        expect(error.message).toContain('Erreur serveur');
      },
    });

    // First request (original)
    const req1 = httpMock.expectOne('/test');
    req1.flush('Server Error', { status: 500, statusText: 'Server Error' });
    
    // Retry request
    const req2 = httpMock.expectOne('/test');
    req2.flush('Server Error', { status: 500, statusText: 'Server Error' });
  });

  it('should handle network error (status 0)', () => {
    httpClient.get('/test').subscribe({
      error: (error) => {
        expect(error.message).toContain('inaccessible');
      },
    });

    // First request (original)
    const req1 = httpMock.expectOne('/test');
    req1.error(new ProgressEvent('error'), { status: 0 });
    
    // Retry request
    const req2 = httpMock.expectOne('/test');
    req2.error(new ProgressEvent('error'), { status: 0 });
  });
});
