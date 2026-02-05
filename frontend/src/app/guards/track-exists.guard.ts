import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { TrackService } from '../services/track.service';

/**
 * Track Exists Guard (Functional - Angular 19+)
 * 
 * Vérifie qu'un track existe avant d'accéder à sa page de détail ou d'édition.
 * Si le track n'existe pas, redirige vers la bibliothèque.
 * 
 * NOTE: Utilise TrackService directement (et non NgRx Store) pour avoir
 * l'état le plus récent après les opérations CRUD.
 */
export const trackExistsGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  const trackService = inject(TrackService);
  const router = inject(Router);
  const trackId = route.paramMap.get('id');

  if (!trackId) {
    console.warn('No track ID provided in route');
    return of(router.createUrlTree(['/library']));
  }

  // Utiliser tracks$ du TrackService pour vérifier l'existence
  return trackService.tracks$.pipe(
    take(1),
    map(tracks => {
      const trackExists = tracks.some(track => track.id === trackId);

      if (trackExists) {
        return true;
      } else {
        console.warn(`Track with ID ${trackId} not found in TrackService`);
        return router.createUrlTree(['/library']);
      }
    })
  );
};

/**
 * Track Exists Guard (Class-based - Legacy support)
 */
@Injectable({
  providedIn: 'root',
})
export class TrackExistsGuard implements CanActivate {
  private trackService = inject(TrackService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return trackExistsGuard(route, state) as Observable<boolean | UrlTree>;
  }
}
