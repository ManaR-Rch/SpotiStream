import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioPlayerService } from '../services/audio-player.service';
import { TrackService } from '../services/track.service';
import { Observable } from 'rxjs';
import { AudioPlayerState } from '../models/track.model';

/**
 * Composant Audio Player
 * 
 * Affiche les contrôles de lecture:
 * - Boutons play/pause/stop
 * - Boutons next/previous
 * - Barre de progression
 * - Contrôle du volume
 * 
 * Niveau: DÉBUTANT - Code simple et lisible
 */
@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-player.component.html',
  styleUrl: './audio-player.component.css'
})
export class AudioPlayerComponent implements OnInit {
  // Observable pour l'état du lecteur (avec async pipe)
  playerState$: Observable<AudioPlayerState>;
  
  // Exposer Math pour le template
  Math = Math;

  constructor(
    private audioPlayerService: AudioPlayerService,
    private trackService: TrackService
  ) {
    this.playerState$ = this.audioPlayerService.playerState$;
  }

  ngOnInit(): void {
    // Initialiser la playlist
    this.trackService.getTracks().subscribe((tracks) => {
      this.audioPlayerService.setPlaylist(tracks);
    });
  }

  /**
   * Lance la lecture
   */
  play(): void {
    this.audioPlayerService.play(
      'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      'default-track'
    );
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
   * Passe à la piste suivante
   */
  next(): void {
    this.audioPlayerService.next();
  }

  /**
   * Revient à la piste précédente
   */
  previous(): void {
    this.audioPlayerService.previous();
  }

  /**
   * Change le volume
   */
  setVolume(event: any): void {
    const volume = parseFloat(event.target.value);
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
