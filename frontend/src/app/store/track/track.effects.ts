import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, switchMap } from 'rxjs/operators';
import { ApiService } from '../../services/backend/api.service';
import { SongTrackAdapter } from '../../services/backend/song-track.adapter';
import { IndexedDbStorageService } from '../../services/indexed-db-storage.service';
import { StorageService } from '../../services/storage.service';
import * as TrackActions from './track.actions';
import { Track } from '../../models/track.model';

/**
 * NgRx Effects pour les Tracks
 * 
 * Les Effects gèrent les side effects (appels API, stockage, etc.)
 * Ils écoutent les actions et peuvent dispatcher de nouvelles actions.
 * 
 * Flow: Action → Effect → API Call → Success/Failure Action
 */
@Injectable()
export class TrackEffects {
  private actions$ = inject(Actions);
  private apiService = inject(ApiService);
  private indexedDbStorage = inject(IndexedDbStorageService);
  private storageService = inject(StorageService);

  /**
   * Effect: Charger les tracks depuis l'API
   * Fallback vers localStorage si l'API échoue
   */
  loadTracks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.loadTracks),
      switchMap(() =>
        this.apiService.getAllTracks().pipe(
          map((songs: any[]) => {
            const tracks = SongTrackAdapter.songsToTracks(songs);
            return TrackActions.loadTracksSuccess({ tracks });
          }),
          catchError((error) => {
            console.warn('API not available, using localStorage fallback', error);
            // Fallback to localStorage
            const tracks = this.storageService.getTracks();
            return of(TrackActions.loadTracksSuccess({ tracks }));
          })
        )
      )
    )
  );

  /**
   * Effect: Ajouter un track
   */
  addTrack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.addTrack),
      mergeMap(async ({ track, audioFile, coverImage }) => {
        try {
          // Générer un ID unique
          const newTrack: Track = {
            ...track,
            id: this.generateId(),
            addedDate: new Date(),
          } as Track;

          // Stocker le fichier audio dans IndexedDB
          if (audioFile) {
            const audioUrl = await this.indexedDbStorage.storeAudioFile(newTrack.id, audioFile);
            newTrack.filePath = audioUrl;
          }

          // Stocker l'image de couverture dans IndexedDB
          if (coverImage) {
            const coverUrl = await this.indexedDbStorage.storeCoverImage(newTrack.id, coverImage);
            newTrack.coverImage = coverUrl;
          }

          // Sauvegarder les métadonnées dans localStorage
          this.storageService.addTrack(newTrack);

          // Essayer de synchroniser avec l'API
          try {
            const songDTO = SongTrackAdapter.trackToSong(newTrack);
            await this.apiService.createTrack(songDTO).toPromise();
          } catch (apiError) {
            console.warn('Could not sync with API, saved locally only', apiError);
          }

          return TrackActions.addTrackSuccess({ track: newTrack });
        } catch (error: any) {
          return TrackActions.addTrackFailure({ error: error.message || 'Failed to add track' });
        }
      })
    )
  );

  /**
   * Effect: Mettre à jour un track
   */
  updateTrack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.updateTrack),
      mergeMap(async ({ track, audioFile, coverImage }) => {
        try {
          const updatedTrack = { ...track };

          // Mettre à jour le fichier audio si fourni
          if (audioFile) {
            const audioUrl = await this.indexedDbStorage.storeAudioFile(track.id, audioFile);
            updatedTrack.filePath = audioUrl;
          }

          // Mettre à jour l'image de couverture si fournie
          if (coverImage) {
            const coverUrl = await this.indexedDbStorage.storeCoverImage(track.id, coverImage);
            updatedTrack.coverImage = coverUrl;
          }

          // Mettre à jour dans localStorage
          this.storageService.updateTrack(track.id, updatedTrack);

          // Essayer de synchroniser avec l'API
          try {
            const songDTO = SongTrackAdapter.trackToSong(updatedTrack);
            await this.apiService.updateTrack(track.id, songDTO).toPromise();
          } catch (apiError) {
            console.warn('Could not sync with API, updated locally only', apiError);
          }

          return TrackActions.updateTrackSuccess({ track: updatedTrack });
        } catch (error: any) {
          return TrackActions.updateTrackFailure({ error: error.message || 'Failed to update track' });
        }
      })
    )
  );

  /**
   * Effect: Supprimer un track
   */
  deleteTrack$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.deleteTrack),
      mergeMap(async ({ id }) => {
        try {
          // Supprimer les fichiers de IndexedDB
          await this.indexedDbStorage.deleteAllTrackFiles(id);

          // Supprimer de localStorage
          this.storageService.deleteTrack(id);

          // Essayer de supprimer de l'API
          try {
            await this.apiService.deleteTrack(id).toPromise();
          } catch (apiError) {
            console.warn('Could not sync deletion with API', apiError);
          }

          return TrackActions.deleteTrackSuccess({ id });
        } catch (error: any) {
          return TrackActions.deleteTrackFailure({ error: error.message || 'Failed to delete track' });
        }
      })
    )
  );

  /**
   * Effect: Réorganiser les tracks
   */
  reorderTracks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TrackActions.reorderTracks),
      map(({ trackIds }) => {
        // Sauvegarder l'ordre dans localStorage
        this.storageService.saveTrackOrder(trackIds);
        
        // Récupérer les tracks dans le nouvel ordre
        const allTracks = this.storageService.getTracks();
        const reorderedTracks = trackIds
          .map(id => allTracks.find(t => t.id === id))
          .filter((t): t is Track => t !== undefined);

        return TrackActions.reorderTracksSuccess({ tracks: reorderedTracks });
      })
    )
  );

  /**
   * Effect: Clear success after delay
   */
  clearSuccessAfterDelay$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        TrackActions.addTrackSuccess,
        TrackActions.updateTrackSuccess,
        TrackActions.deleteTrackSuccess
      ),
      tap(() => {
        setTimeout(() => {
          // Dispatch clearSuccess after 3 seconds
        }, 3000);
      })
    ),
    { dispatch: false }
  );

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
