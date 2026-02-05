import { Injectable, signal } from '@angular/core';
import {
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
  HttpHandler,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

// Signal for tracking loading state globally (Angular 19+)
let activeRequests = 0;
export const isLoading = signal(false);

/**
 * Loading Interceptor (Functional - Angular 19+)
 * 
 * Intercepte les requêtes HTTP pour gérer un indicateur de chargement global.
 * Utilise un Signal pour le state reactif.
 */
export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  activeRequests++;

  if (activeRequests === 1) {
    isLoading.set(true);
    console.log('🔄 Loading started...');
  }

  return next(req).pipe(
    finalize(() => {
      activeRequests--;

      if (activeRequests === 0) {
        isLoading.set(false);
        console.log('✅ Loading finished');
      }
    })
  );
};

/**
 * Loading Interceptor (Class-based - Legacy support)
 * 
 * Intercepte les requêtes HTTP pour gérer un indicateur de chargement global.
 * Utile pour afficher un spinner pendant les appels API.
 */
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Incrémenter le compteur de requêtes actives
    this.activeRequests++;

    if (this.activeRequests === 1) {
      // Première requête - on pourrait déclencher un loading indicator global
      isLoading.set(true);
      console.log('🔄 Loading started...');
    }

    return next.handle(request).pipe(
      finalize(() => {
        // Décrémenter le compteur quand la requête est terminée
        this.activeRequests--;

        if (this.activeRequests === 0) {
          // Toutes les requêtes sont terminées
          isLoading.set(false);
          console.log('✅ Loading finished');
        }
      })
    );
  }

  /**
   * Retourne le nombre de requêtes en cours
   */
  getActiveRequestsCount(): number {
    return this.activeRequests;
  }

  /**
   * Indique si des requêtes sont en cours
   */
  isLoadingState(): boolean {
    return this.activeRequests > 0;
  }
}
