import { trackReducer } from './track.reducer';
import { initialTrackState, TrackState } from './track.state';
import * as TrackActions from './track.actions';
import { Track } from '../../models/track.model';

describe('Track Reducer', () => {
  const mockTrack: Track = {
    id: '1',
    title: 'Test Track',
    artist: 'Test Artist',
    duration: 180,
    category: 'pop',
    addedDate: new Date(),
  };

  describe('unknown action', () => {
    it('should return the initial state', () => {
      const action = { type: 'Unknown' };
      const state = trackReducer(initialTrackState, action);

      expect(state).toBe(initialTrackState);
    });
  });

  describe('loadTracks', () => {
    it('should set loading to true', () => {
      const action = TrackActions.loadTracks();
      const state = trackReducer(initialTrackState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('loadTracksSuccess', () => {
    it('should set tracks and loading to false', () => {
      const tracks = [mockTrack];
      const action = TrackActions.loadTracksSuccess({ tracks });
      const state = trackReducer(initialTrackState, action);

      expect(state.tracks).toEqual(tracks);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('loadTracksFailure', () => {
    it('should set error and loading to false', () => {
      const error = 'Error loading tracks';
      const action = TrackActions.loadTracksFailure({ error });
      const state = trackReducer(initialTrackState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(error);
    });
  });

  describe('addTrackSuccess', () => {
    it('should add track to the list', () => {
      const action = TrackActions.addTrackSuccess({ track: mockTrack });
      const state = trackReducer(initialTrackState, action);

      expect(state.tracks).toContain(mockTrack);
      expect(state.loading).toBe(false);
      expect(state.success).toBe(true);
    });
  });

  describe('updateTrackSuccess', () => {
    it('should update existing track', () => {
      const initialState: TrackState = {
        ...initialTrackState,
        tracks: [mockTrack],
      };

      const updatedTrack = { ...mockTrack, title: 'Updated Title' };
      const action = TrackActions.updateTrackSuccess({ track: updatedTrack });
      const state = trackReducer(initialState, action);

      expect(state.tracks[0].title).toBe('Updated Title');
      expect(state.success).toBe(true);
    });
  });

  describe('deleteTrackSuccess', () => {
    it('should remove track from the list', () => {
      const initialState: TrackState = {
        ...initialTrackState,
        tracks: [mockTrack],
      };

      const action = TrackActions.deleteTrackSuccess({ id: '1' });
      const state = trackReducer(initialState, action);

      expect(state.tracks.length).toBe(0);
      expect(state.success).toBe(true);
    });

    it('should clear selectedTrackId if deleted track was selected', () => {
      const initialState: TrackState = {
        ...initialTrackState,
        tracks: [mockTrack],
        selectedTrackId: '1',
      };

      const action = TrackActions.deleteTrackSuccess({ id: '1' });
      const state = trackReducer(initialState, action);

      expect(state.selectedTrackId).toBeNull();
    });
  });

  describe('selectTrack', () => {
    it('should set selectedTrackId', () => {
      const action = TrackActions.selectTrack({ id: '1' });
      const state = trackReducer(initialTrackState, action);

      expect(state.selectedTrackId).toBe('1');
    });
  });

  describe('clearSelectedTrack', () => {
    it('should clear selectedTrackId', () => {
      const initialState: TrackState = {
        ...initialTrackState,
        selectedTrackId: '1',
      };

      const action = TrackActions.clearSelectedTrack();
      const state = trackReducer(initialState, action);

      expect(state.selectedTrackId).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const initialState: TrackState = {
        ...initialTrackState,
        error: 'Some error',
      };

      const action = TrackActions.clearError();
      const state = trackReducer(initialState, action);

      expect(state.error).toBeNull();
    });
  });
});
 