import { createReducer, on } from '@ngrx/store';
import { initialTrackState, TrackState } from './track.state';
import * as TrackActions from './track.actions';

/**
 * NgRx Reducer pour les Tracks
 * 
 * Le reducer est une fonction pure qui prend l'état actuel et une action,
 * et retourne un nouvel état.
 * 
 * Principe: (state, action) => newState
 */
export const trackReducer = createReducer(
  initialTrackState,

  // ============================================
  // LOAD TRACKS
  // ============================================
  
  on(TrackActions.loadTracks, (state): TrackState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(TrackActions.loadTracksSuccess, (state, { tracks }): TrackState => ({
    ...state,
    tracks,
    loading: false,
    error: null,
  })),

  on(TrackActions.loadTracksFailure, (state, { error }): TrackState => ({
    ...state,
    loading: false,
    error,
  })),

  // ============================================
  // ADD TRACK
  // ============================================
  
  on(TrackActions.addTrack, (state): TrackState => ({
    ...state,
    loading: true,
    error: null,
    success: false,
  })),

  on(TrackActions.addTrackSuccess, (state, { track }): TrackState => ({
    ...state,
    tracks: [...state.tracks, track],
    loading: false,
    success: true,
    error: null,
  })),

  on(TrackActions.addTrackFailure, (state, { error }): TrackState => ({
    ...state,
    loading: false,
    error,
    success: false,
  })),

  // ============================================
  // UPDATE TRACK
  // ============================================
  
  on(TrackActions.updateTrack, (state): TrackState => ({
    ...state,
    loading: true,
    error: null,
    success: false,
  })),

  on(TrackActions.updateTrackSuccess, (state, { track }): TrackState => ({
    ...state,
    tracks: state.tracks.map(t => t.id === track.id ? track : t),
    loading: false,
    success: true,
    error: null,
  })),

  on(TrackActions.updateTrackFailure, (state, { error }): TrackState => ({
    ...state,
    loading: false,
    error,
    success: false,
  })),

  // ============================================
  // DELETE TRACK
  // ============================================
  
  on(TrackActions.deleteTrack, (state): TrackState => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(TrackActions.deleteTrackSuccess, (state, { id }): TrackState => ({
    ...state,
    tracks: state.tracks.filter(t => t.id !== id),
    loading: false,
    success: true,
    selectedTrackId: state.selectedTrackId === id ? null : state.selectedTrackId,
  })),

  on(TrackActions.deleteTrackFailure, (state, { error }): TrackState => ({
    ...state,
    loading: false,
    error,
  })),

  // ============================================
  // SELECT TRACK
  // ============================================
  
  on(TrackActions.selectTrack, (state, { id }): TrackState => ({
    ...state,
    selectedTrackId: id,
  })),

  on(TrackActions.clearSelectedTrack, (state): TrackState => ({
    ...state,
    selectedTrackId: null,
  })),

  // ============================================
  // REORDER TRACKS
  // ============================================
  
  on(TrackActions.reorderTracks, (state): TrackState => ({
    ...state,
    loading: true,
  })),

  on(TrackActions.reorderTracksSuccess, (state, { tracks }): TrackState => ({
    ...state,
    tracks,
    loading: false,
  })),

  // ============================================
  // CLEAR ERROR/SUCCESS
  // ============================================
  
  on(TrackActions.clearError, (state): TrackState => ({
    ...state,
    error: null,
  })),

  on(TrackActions.clearSuccess, (state): TrackState => ({
    ...state,
    success: false,
  })),
);
