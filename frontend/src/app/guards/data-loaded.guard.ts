import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { map, take, filter } from 'rxjs/operators';
import { selectTracksLoading, selectAllTracks } from '../store/track/track.selectors';
import { loadTracks } from '../store/track/track.actions';

// Track initialization state for functional guard
let initialized = false;

/**
 * Data Loaded Guard (Functional - Angular 19+)
 * 
 * S'assure que les données sont chargées avant d'accéder à une route.
 * Déclenche le chargement des tracks si nécessaire.
 */
export const dataLoadedGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  const store = inject(Store);

  // Charger les tracks si pas encore fait
  if (!initialized) {
    store.dispatch(loadTracks());
    initialized = true;
  }

  // Attendre que le chargement soit terminé
  return store.select(selectTracksLoading).pipe(
    filter(loading => !loading), // Attendre que loading soit false
    take(1),
    map(() => true)
  );
};

/**
 * Data Loaded Guard (Class-based - Legacy support)
 */
@Injectable({
  providedIn: 'root',
})
export class DataLoadedGuard implements CanActivate {
  private store = inject(Store);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return dataLoadedGuard(route, state) as Observable<boolean | UrlTree>;
  }
}
