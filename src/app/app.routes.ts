import { Routes } from '@angular/router';

/**
 * Routes de l'application
 * 
 * Configuration simple et lisible:
 * - Redirection par défaut vers /library
 * - Pages principales: library et track detail
 * - Wildcard pour les URLs invalides
 * 
 * Niveau: DÉBUTANT - Pas de lazy loading complexe
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
      import('./pages/library.component').then(m => m.LibraryComponent)
  },
  {
    path: 'add-track',
    loadComponent: () =>
      import('./components/add-track.component').then(m => m.AddTrackComponent)
  },
  {
    path: 'track/:id',
    loadComponent: () =>
      import('./pages/track-detail.component').then(m => m.TrackDetailComponent)
  },
  {
    path: '**',
    redirectTo: '/library'
  }
];

