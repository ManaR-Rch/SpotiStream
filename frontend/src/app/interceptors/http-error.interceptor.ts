import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpHandlerFn,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

/**
 * Génère un message d'erreur lisible selon le code HTTP
 */
function getServerErrorMessage(error: HttpErrorResponse): string {
  switch (error.status) {
    case 0:
      return 'Le serveur est inaccessible. Vérifiez votre connexion.';
    case 400:
      return error.error?.message || 'Requête invalide. Vérifiez les données envoyées.';
    case 401:
      return 'Non autorisé. Veuillez vous connecter.';
    case 403:
      return 'Accès refusé. Vous n\'avez pas les droits nécessaires.';
    case 404:
      return 'Ressource non trouvée.';
    case 409:
      return 'Conflit. La ressource existe déjà.';
    case 422:
      return error.error?.message || 'Données invalides.';
    case 500:
      return 'Erreur serveur interne. Réessayez plus tard.';
    case 502:
      return 'Passerelle incorrecte. Le serveur est peut-être en maintenance.';
    case 503:
      return 'Service indisponible. Réessayez plus tard.';
    case 504:
      return 'Délai d\'attente dépassé. Le serveur met trop de temps à répondre.';
    default:
      return `Erreur ${error.status}: ${error.message}`;
  }
}

/**
 * Log l'erreur pour le debugging
 */
function logError(request: HttpRequest<unknown>, error: HttpErrorResponse): void {
  const errorLog = {
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
    status: error.status,
    statusText: error.statusText,
    message: error.message,
    error: error.error,
  };

  // En production, on pourrait envoyer ce log à un service de monitoring
  console.group('🔴 HTTP Error');
  console.table(errorLog);
  console.groupEnd();
}

/**
 * HTTP Error Interceptor (Functional - Angular 19+)
 * 
 * Intercepte toutes les requêtes HTTP et gère les erreurs de manière globale.
 * 
 * Fonctionnalités:
 * - Retry automatique (1 fois) pour les erreurs réseau
 * - Transformation des erreurs en messages utilisateur
 * - Logging des erreurs pour le debugging
 */
export const httpErrorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  return next(req).pipe(
    // Retry 1 fois pour les erreurs réseau temporaires
    retry(1),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';

      if (error.error instanceof ErrorEvent) {
        // Erreur côté client (réseau, etc.)
        errorMessage = `Client Error: ${error.error.message}`;
        console.error('Client-side error:', error.error.message);
      } else {
        // Erreur côté serveur
        errorMessage = getServerErrorMessage(error);
        console.error(
          `Server Error: ${error.status}`,
          error.message,
          error.error
        );
      }

      // Log l'erreur pour le debugging
      logError(req, error);

      return throwError(() => new Error(errorMessage));
    })
  );
};

/**
 * HTTP Error Interceptor (Class-based - Legacy support)
 * 
 * Intercepte toutes les requêtes HTTP et gère les erreurs de manière globale.
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';

        if (error.error instanceof ErrorEvent) {
          errorMessage = `Client Error: ${error.error.message}`;
        } else {
          errorMessage = getServerErrorMessage(error);
        }

        logError(request, error);

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
