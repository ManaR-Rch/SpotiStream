import { Track } from '../../models/track.model';

/**
 * État du Store Track
 */
export interface TrackState {
  tracks: Track[];
  selectedTrackId: string | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * État initial
 */
export const initialTrackState: TrackState = {
  tracks: [],
  selectedTrackId: null,
  loading: false,
  error: null,
  success: false,
};
