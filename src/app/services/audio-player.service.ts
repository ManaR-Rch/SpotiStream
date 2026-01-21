import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AudioPlayerState, AudioPlayerStatus, Track } from '../models/track.model';

/**
 * Service pour gérer le lecteur audio
 * 
 * Contrôle:
 * - Play/Pause/Stop
 * - Next/Previous (navigation dans la playlist)
 * - Volume et progression
 * - Gestion de la playlist
 * 
 * Niveau: DÉBUTANT - Code simple et lisible
 */
@Injectable({
  providedIn: 'root',
})
export class AudioPlayerService {
  // État initial du lecteur
  private initialState: AudioPlayerState = {
    status: 'stopped',
    currentTrackId: null,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isLoading: false,
  };

  // BehaviorSubject pour gérer l'état réactif du lecteur
  private playerState = new BehaviorSubject<AudioPlayerState>(
    this.initialState
  );
  public playerState$ = this.playerState.asObservable();

  // Playlist et index courant
  private playlist: Track[] = [];
  private currentTrackIndex: number = -1;

  // Élément audio HTML
  private audioElement: HTMLAudioElement | null = null;

  constructor() {
    this.initializeAudio();
    console.log('AudioPlayerService initialized');
  }

  /**
   * Initialise l'élément audio HTML
   */
  private initializeAudio(): void {
    // On crée un élément audio (même s'il n'y a pas encore de son)
    this.audioElement = new Audio();
    this.audioElement.volume = this.playerState.value.volume;

    // Écouter les événements de l'élément audio
    this.audioElement.addEventListener('play', () => this.onPlay());
    this.audioElement.addEventListener('pause', () => this.onPause());
    this.audioElement.addEventListener('ended', () => this.onEnded());
    this.audioElement.addEventListener('timeupdate', () =>
      this.onTimeUpdate()
    );
    this.audioElement.addEventListener('loadedmetadata', () =>
      this.onLoadedMetadata()
    );
  }

  /**
   * Définir la playlist
   * @param tracks - Array de tracks
   */
  setPlaylist(tracks: Track[]): void {
    this.playlist = tracks;
  }

  /**
   * Lance la lecture d'une piste
   * @param trackFilePath - Chemin du fichier audio
   * @param trackId - ID du track (optionnel, pour la navigation)
   */
  play(trackFilePath: string, trackId?: string): void {
    if (this.audioElement) {
      this.audioElement.src = trackFilePath;
      if (trackId) {
        this.updateState({ currentTrackId: trackId });
      }
      this.audioElement.play().catch((error) => {
        console.error('Erreur lors de la lecture:', error);
        this.setError();
      });
    }
  }

  /**
   * Met en pause la lecture
   */
  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  /**
   * Arrête la lecture
   */
  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.updateState({ status: 'stopped', currentTime: 0 });
    }
  }

  /**
   * Change le volume
   * @param volume - Valeur entre 0 et 1
   */
  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      this.audioElement.volume = clampedVolume;
    }
    this.updateState({ volume: clampedVolume });
  }

  /**
   * Définit la progression actuelle
   * @param time - Temps en secondes
   */
  seek(time: number): void {
    if (this.audioElement) {
      this.audioElement.currentTime = time;
    }
  }

  /**
   * Passe à la piste suivante
   */
  next(): void {
    // Augmenter l'index
    this.currentTrackIndex++;

    // Si on est à la fin de la playlist, revenir au début
    if (this.currentTrackIndex >= this.playlist.length) {
      this.currentTrackIndex = 0;
    }

    // Charger et lancer la piste
    const nextTrack = this.playlist[this.currentTrackIndex];
    if (nextTrack && nextTrack.filePath) {
      this.play(nextTrack.filePath, nextTrack.id);
      console.log('Playing next track:', nextTrack.title);
    }
  }

  /**
   * Revient à la piste précédente
   */
  previous(): void {
    // Diminuer l'index
    this.currentTrackIndex--;

    // Si on est avant le début, aller à la fin
    if (this.currentTrackIndex < 0) {
      this.currentTrackIndex = this.playlist.length - 1;
    }

    // Charger et lancer la piste
    const prevTrack = this.playlist[this.currentTrackIndex];
    if (prevTrack && prevTrack.filePath) {
      this.play(prevTrack.filePath, prevTrack.id);
      console.log('Playing previous track:', prevTrack.title);
    }
  }

  /**
   * Appelé quand la lecture commence
   */
  private onPlay(): void {
    this.updateState({ status: 'playing' });
  }

  /**
   * Appelé quand la lecture est mise en pause
   */
  private onPause(): void {
    this.updateState({ status: 'paused' });
  }

  /**
   * Appelé quand la piste se termine
   */
  private onEnded(): void {
    this.updateState({ status: 'stopped', currentTime: 0 });
  }

  /**
   * Appelé à chaque mise à jour de la position de lecture
   */
  private onTimeUpdate(): void {
    if (this.audioElement) {
      this.updateState({ currentTime: this.audioElement.currentTime });
    }
  }

  /**
   * Appelé quand les métadonnées de l'audio sont chargées
   */
  private onLoadedMetadata(): void {
    if (this.audioElement) {
      this.updateState({ duration: this.audioElement.duration });
    }
  }

  /**
   * Définit l'état en cas d'erreur
   */
  private setError(): void {
    this.updateState({ status: 'stopped' });
  }

  /**
   * Met à jour l'état du lecteur
   * @param newState - Les changements d'état
   */
  private updateState(newState: Partial<AudioPlayerState>): void {
    const currentState = this.playerState.value;
    this.playerState.next({ ...currentState, ...newState });
  }
}
