import { Routes } from '@angular/router';
import { LibraryComponent } from './pages/library.component';
import { TrackDetailComponent } from './pages/track-detail.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/library',
    pathMatch: 'full'
  },
  {
    path: 'library',
    component: LibraryComponent
  },
  {
    path: 'track/:id',
    component: TrackDetailComponent
  },
  {
    path: '**',
    redirectTo: '/library'
  }
];
