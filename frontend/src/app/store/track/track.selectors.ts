import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TrackState } from './track.state';
import { Track } from '../../models/track.model';

/**
 * NgRx Selectors pour les Tracks
 * 
 * Les selectors permettent de:
 * - Extraire des données du store de manière efficace
 * - Mémoriser les résultats (memoization)
 * - Composer des sélecteurs complexes
 */

// Feature selector - sélectionne le slice 'tracks' du store
export const selectTrackState = createFeatureSelector<TrackState>('tracks');

// ============================================
// BASIC SELECTORS
// ============================================

/**
 * Sélectionne tous les tracks
 */
export const selectAllTracks = createSelector(
  selectTrackState,
  (state: TrackState) => state.tracks
);

/**
 * Sélectionne l'état de chargement
 */
export const selectTracksLoading = createSelector(
  selectTrackState,
  (state: TrackState) => state.loading
);

/**
 * Sélectionne l'erreur
 */
export const selectTracksError = createSelector(
  selectTrackState,
  (state: TrackState) => state.error
);

/**
 * Sélectionne l'état de succès
 */
export const selectTracksSuccess = createSelector(
  selectTrackState,
  (state: TrackState) => state.success
);

/**
 * Sélectionne l'ID du track sélectionné
 */
export const selectSelectedTrackId = createSelector(
  selectTrackState,
  (state: TrackState) => state.selectedTrackId
);

// ============================================
// COMPUTED SELECTORS
// ============================================

/**
 * Sélectionne le track actuellement sélectionné
 */
export const selectSelectedTrack = createSelector(
  selectAllTracks,
  selectSelectedTrackId,
  (tracks, selectedId) => 
    selectedId ? tracks.find(track => track.id === selectedId) || null : null
);

/**
 * Sélectionne le nombre total de tracks
 */
export const selectTrackCount = createSelector(
  selectAllTracks,
  (tracks) => tracks.length
);

/**
 * Sélectionne les tracks par catégorie
 */
export const selectTracksByCategory = (category: string) =>
  createSelector(selectAllTracks, (tracks) =>
    category === 'all' || category === ''
      ? tracks
      : tracks.filter(track => track.category === category)
  );

/**
 * Sélectionne les catégories uniques
 */
export const selectUniqueCategories = createSelector(
  selectAllTracks,
  (tracks) => {
    const categories = tracks
      .map(track => track.category)
      .filter((category): category is Track['category'] => !!category);
    return ['all', ...new Set(categories)];
  }
);

/**
 * Recherche des tracks par titre ou artiste
 */
export const selectTracksBySearch = (searchTerm: string) =>
  createSelector(selectAllTracks, (tracks) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return tracks;
    }
    const term = searchTerm.toLowerCase();
    return tracks.filter(
      track =>
        track.title.toLowerCase().includes(term) ||
        track.artist.toLowerCase().includes(term)
    );
  });

/**
 * Sélectionne les tracks triés par date d'ajout (plus récent en premier)
 */
export const selectTracksSortedByDate = createSelector(
  selectAllTracks,
  (tracks) =>
    [...tracks].sort(
      (a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
    )
);

/**
 * Sélectionne les tracks triés par titre
 */
export const selectTracksSortedByTitle = createSelector(
  selectAllTracks,
  (tracks) =>
    [...tracks].sort((a, b) => a.title.localeCompare(b.title))
);

/**
 * Sélectionne la durée totale de tous les tracks (en secondes)
 */
export const selectTotalDuration = createSelector(
  selectAllTracks,
  (tracks) => tracks.reduce((total, track) => total + (track.duration || 0), 0)
);

/**
 * Sélectionne un track par ID
 */
export const selectTrackById = (id: string) =>
  createSelector(selectAllTracks, (tracks) =>
    tracks.find(track => track.id === id) || null
  );

/**
 * Sélectionne les tracks likés
 */
export const selectLikedTracks = createSelector(
  selectAllTracks,
  (tracks) => tracks.filter(track => track.liked)
);

/**
 * ViewModel pour la page Library
 */
export const selectLibraryViewModel = createSelector(
  selectAllTracks,
  selectTracksLoading,
  selectTracksError,
  selectTrackCount,
  (tracks, loading, error, count) => ({
    tracks,
    loading,
    error,
    count,
    isEmpty: count === 0,
  })
);
