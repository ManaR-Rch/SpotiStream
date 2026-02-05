import { createAction, props } from '@ngrx/store';
import { Track } from '../../models/track.model';

/**
 * NgRx Actions pour la gestion des Tracks
 * 
 * Convention de nommage:
 * - [Source] Event Name
 * - Source = composant/service qui déclenche l'action
 * - Event Name = ce qui s'est passé
 */

// ============================================
// LOAD TRACKS ACTIONS
// ============================================

export const loadTracks = createAction(
  '[Track List] Load Tracks'
);

export const loadTracksSuccess = createAction(
  '[Track API] Load Tracks Success',
  props<{ tracks: Track[] }>()
);

export const loadTracksFailure = createAction(
  '[Track API] Load Tracks Failure',
  props<{ error: string }>()
);

// ============================================
// ADD TRACK ACTIONS
// ============================================

export const addTrack = createAction(
  '[Add Track Page] Add Track',
  props<{ track: Omit<Track, 'id' | 'addedDate'>; audioFile?: File; coverImage?: File }>()
);

export const addTrackSuccess = createAction(
  '[Track API] Add Track Success',
  props<{ track: Track }>()
);

export const addTrackFailure = createAction(
  '[Track API] Add Track Failure',
  props<{ error: string }>()
);

// ============================================
// UPDATE TRACK ACTIONS
// ============================================

export const updateTrack = createAction(
  '[Edit Track Page] Update Track',
  props<{ track: Track; audioFile?: File; coverImage?: File }>()
);

export const updateTrackSuccess = createAction(
  '[Track API] Update Track Success',
  props<{ track: Track }>()
);

export const updateTrackFailure = createAction(
  '[Track API] Update Track Failure',
  props<{ error: string }>()
);

// ============================================
// DELETE TRACK ACTIONS
// ============================================

export const deleteTrack = createAction(
  '[Track Card] Delete Track',
  props<{ id: string }>()
);

export const deleteTrackSuccess = createAction(
  '[Track API] Delete Track Success',
  props<{ id: string }>()
);

export const deleteTrackFailure = createAction(
  '[Track API] Delete Track Failure',
  props<{ error: string }>()
);

// ============================================
// SELECT TRACK ACTION
// ============================================

export const selectTrack = createAction(
  '[Track Detail] Select Track',
  props<{ id: string }>()
);

export const clearSelectedTrack = createAction(
  '[Track Detail] Clear Selected Track'
);

// ============================================
// REORDER TRACKS ACTION
// ============================================

export const reorderTracks = createAction(
  '[Library] Reorder Tracks',
  props<{ trackIds: string[] }>()
);

export const reorderTracksSuccess = createAction(
  '[Track API] Reorder Tracks Success',
  props<{ tracks: Track[] }>()
);

// ============================================
// CLEAR ERROR ACTION
// ============================================

export const clearError = createAction(
  '[Track] Clear Error'
);

export const clearSuccess = createAction(
  '[Track] Clear Success'
);
