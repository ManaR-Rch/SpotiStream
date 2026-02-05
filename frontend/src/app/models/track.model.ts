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
  plays?: number;          // Nombre de lectures
  liked?: boolean;         // Piste aimée
  coverImage?: string;     // URL de l'image de couverture (blob ou externe)
  coverImageSize?: number; // Taille de l'image en bytes
  order?: number;          // Ordre dans la bibliothèque (pour drag & drop)
}

/**
 * Constantes pour validation
 */
export const TRACK_VALIDATION = {
  TITLE_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 200,
  MIN_DURATION: 1,
  CATEGORIES: ['pop', 'rock', 'rap', 'jazz', 'classical', 'electronic', 'other'] as const,
  MAX_AUDIO_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  MAX_IMAGE_FILE_SIZE: 5 * 1024 * 1024,  // 5 MB
  ALLOWED_AUDIO_FORMATS: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  ALLOWED_AUDIO_EXTENSIONS: ['.mp3', '.wav', '.ogg'],
  ALLOWED_IMAGE_FORMATS: ['image/png', 'image/jpeg', 'image/jpg'],
  ALLOWED_IMAGE_EXTENSIONS: ['.png', '.jpeg', '.jpg']
};

/**
 * Type pour les états de chargement
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * État du service Track
 */
export interface TrackState {
  tracks: Track[];
  loading: boolean;
  error: string | null;
  success: boolean;
  loadingState: LoadingState;
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

/**
 * Interface pour les résultats de validation
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Interface pour les paroles de chanson (Lyrics API)
 */
export interface LyricsResult {
  lyrics: string;
  artist: string;
  title: string;
  source?: string;
}
