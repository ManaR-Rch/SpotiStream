import { Routes } from '@angular/router';
import { trackExistsGuard, dataLoadedGuard } from './guards';

/**
 * Routes de l'application avec lazy loading et guards
 * 
 * Configuration:
 * - Redirection par défaut vers /library
 * - Pages principales: library, add-track, edit-track et track detail
 * - Lazy loading pour chaque composant (performance)
 * - Guards pour vérifier l'existence des données
 * - Wildcard pour les URLs invalides
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: '/library',
    pathMatch: 'full'
  },
  {
    path: 'library',
    loadComponent: () =>
      import('./pages/library.component').then(m => m.LibraryComponent),
    canActivate: [dataLoadedGuard]
  },
  {
    path: 'add-track',
    loadComponent: () =>
      import('./components/add-track.component').then(m => m.AddTrackComponent),
    canActivate: [dataLoadedGuard]
  },
  {
    path: 'edit-track/:id',
    loadComponent: () =>
      import('./components/edit-track.component').then(m => m.EditTrackComponent),
    canActivate: [dataLoadedGuard, trackExistsGuard]
  },
  {
    path: 'track/:id',
    loadComponent: () =>
      import('./pages/track-detail.component').then(m => m.TrackDetailComponent),
    canActivate: [dataLoadedGuard, trackExistsGuard]
  },
  {
    path: '**',
    redirectTo: '/library'
  }
];

