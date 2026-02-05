import * as fromSelectors from './track.selectors';
import { TrackState } from './track.state';
import { Track } from '../../models/track.model';

describe('Track Selectors', () => {
  const mockTracks: Track[] = [
    {
      id: '1',
      title: 'Track A',
      artist: 'Artist 1',
      duration: 180,
      category: 'pop',
      addedDate: new Date('2024-01-01'),
      liked: true,
    },
    {
      id: '2',
      title: 'Track B',
      artist: 'Artist 2',
      duration: 240,
      category: 'rock',
      addedDate: new Date('2024-01-02'),
      liked: false,
    },
    {
      id: '3',
      title: 'Track C',
      artist: 'Artist 1',
      duration: 200,
      category: 'pop',
      addedDate: new Date('2024-01-03'),
      liked: true,
    },
  ];

  const mockState: TrackState = {
    tracks: mockTracks,
    selectedTrackId: '1',
    loading: false,
    error: null,
    success: false,
  };

  describe('selectAllTracks', () => {
    it('should return all tracks', () => {
      const result = fromSelectors.selectAllTracks.projector(mockState);
      expect(result.length).toBe(3);
      expect(result).toEqual(mockTracks);
    });
  });

  describe('selectTracksLoading', () => {
    it('should return loading state', () => {
      const result = fromSelectors.selectTracksLoading.projector(mockState);
      expect(result).toBe(false);
    });
  });

  describe('selectTracksError', () => {
    it('should return error', () => {
      const stateWithError = { ...mockState, error: 'Error!' };
      const result = fromSelectors.selectTracksError.projector(stateWithError);
      expect(result).toBe('Error!');
    });
  });

  describe('selectSelectedTrack', () => {
    it('should return the selected track', () => {
      const result = fromSelectors.selectSelectedTrack.projector(
        mockTracks,
        '1'
      );
      expect(result).toEqual(mockTracks[0]);
    });

    it('should return null if no track is selected', () => {
      const result = fromSelectors.selectSelectedTrack.projector(
        mockTracks,
        null
      );
      expect(result).toBeNull();
    });
  });

  describe('selectTrackCount', () => {
    it('should return the number of tracks', () => {
      const result = fromSelectors.selectTrackCount.projector(mockTracks);
      expect(result).toBe(3);
    });
  });

  describe('selectTracksByCategory', () => {
    it('should filter tracks by category', () => {
      const selector = fromSelectors.selectTracksByCategory('pop');
      const result = selector.projector(mockTracks);
      expect(result.length).toBe(2);
      expect(result.every((t) => t.category === 'pop')).toBe(true);
    });

    it('should return all tracks for "all" category', () => {
      const selector = fromSelectors.selectTracksByCategory('all');
      const result = selector.projector(mockTracks);
      expect(result.length).toBe(3);
    });
  });

  describe('selectTracksBySearch', () => {
    it('should filter tracks by title', () => {
      const selector = fromSelectors.selectTracksBySearch('Track A');
      const result = selector.projector(mockTracks);
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Track A');
    });

    it('should filter tracks by artist', () => {
      const selector = fromSelectors.selectTracksBySearch('Artist 1');
      const result = selector.projector(mockTracks);
      expect(result.length).toBe(2);
    });

    it('should return all tracks for empty search', () => {
      const selector = fromSelectors.selectTracksBySearch('');
      const result = selector.projector(mockTracks);
      expect(result.length).toBe(3);
    });
  });

  describe('selectTotalDuration', () => {
    it('should return total duration of all tracks', () => {
      const result = fromSelectors.selectTotalDuration.projector(mockTracks);
      expect(result).toBe(620); // 180 + 240 + 200
    });
  });

  describe('selectLikedTracks', () => {
    it('should return only liked tracks', () => {
      const result = fromSelectors.selectLikedTracks.projector(mockTracks);
      expect(result.length).toBe(2);
      expect(result.every((t) => t.liked)).toBe(true);
    });
  });

  describe('selectUniqueCategories', () => {
    it('should return unique categories with "all" first', () => {
      const result = fromSelectors.selectUniqueCategories.projector(mockTracks);
      expect(result[0]).toBe('all');
      expect(result).toContain('pop');
      expect(result).toContain('rock');
    });
  });

  describe('selectLibraryViewModel', () => {
    it('should return the library view model', () => {
      const result = fromSelectors.selectLibraryViewModel.projector(
        mockTracks,
        false,
        null,
        3
      );

      expect(result.tracks).toEqual(mockTracks);
      expect(result.loading).toBe(false);
      expect(result.error).toBeNull();
      expect(result.count).toBe(3);
      expect(result.isEmpty).toBe(false);
    });
  });
});
