import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioPlayerService } from '../services/audio-player.service';
import { AudioPlayerState } from '../models/track.model';
import { Subscription } from 'rxjs';

/**
 * Composant Audio Player
 * Affiche les contrôles de lecture et l'état du lecteur
 * - Boutons play/pause/stop
 * - Barre de progression
 * - Contrôle du volume
 */
@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-player.component.html',
  styleUrl: './audio-player.component.css'
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  playerState: AudioPlayerState | null = null;
  private subscription: Subscription | null = null;

  constructor(private audioPlayerService: AudioPlayerService) {}

  ngOnInit(): void {
    // S'abonner aux changements d'état du lecteur
    this.subscription = this.audioPlayerService.playerState$.subscribe(
      (state: AudioPlayerState) => {
        this.playerState = state;
      }
    );
  }

  ngOnDestroy(): void {
    // Se désabonner pour éviter les fuites mémoire
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * Lance la lecture (avec un fichier de test)
   */
  play(): void {
    if (this.playerState?.status === 'paused') {
      // Si en pause, reprendre la lecture
      const currentTrackId = this.playerState.currentTrackId;
      if (currentTrackId) {
        this.audioPlayerService.play(currentTrackId);
      }
    } else {
      // Sinon, jouer le premier track de test
      console.log('Play clicked - no track selected');
      this.audioPlayerService.play('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    }
  }

  /**
   * Met en pause la lecture
   */
  pause(): void {
    this.audioPlayerService.pause();
  }

  /**
   * Arrête la lecture
   */
  stop(): void {
    this.audioPlayerService.stop();
  }

  /**
   * Change le volume
   */
  setVolume(event: any): void {
    const volume = event.target.value;
    this.audioPlayerService.setVolume(volume);
  }

  /**
   * Avance la position de lecture
   */
  seek(event: any): void {
    const time = event.target.value;
    this.audioPlayerService.seek(time);
  }

  /**
   * Formate le temps en minutes:secondes
   */
  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  /**
   * Arrondit un nombre (exposé pour le template)
   */
  Math = Math;
}
