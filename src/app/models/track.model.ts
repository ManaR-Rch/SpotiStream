/**
 * Modèle Track - Représente une piste audio
 */
export interface Track {
  id: string;
  title: string;           // Max 50 caractères
  artist: string;
  description?: string;    // Max 200 caractères, optionnel
  category: 'pop' | 'rock' | 'rap' | 'jazz' | 'classical' | 'electronic' | 'other';
  duration: number;        // En secondes
  addedDate: Date;
  filePath?: string;       // Chemin du fichier audio
  fileSize?: number;       // En bytes
}

/**
 * État du service Track
 */
export interface TrackState {
  tracks: Track[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * État du lecteur audio
 */
export type AudioPlayerStatus = 'playing' | 'paused' | 'stopped' | 'buffering';

export interface AudioPlayerState {
  status: AudioPlayerStatus;
  currentTrackId: string | null;
  currentTime: number;      // En secondes
  duration: number;         // En secondes
  volume: number;           // 0 à 1
  isLoading: boolean;
}
