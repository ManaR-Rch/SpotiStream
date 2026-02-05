import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TrackService } from '../services/track.service';
import { AudioPlayerService } from '../services/audio-player.service';
import { LyricsService } from '../services/lyrics.service';
import { IndexedDbStorageService } from '../services/indexed-db-storage.service';
import { Track, LyricsResult } from '../models/track.model';
import { Observable, Subscription } from 'rxjs';
import { AudioPlayerState } from '../models/track.model';
import { DurationPipe } from '../pipes/duration.pipe';

/**
 * Page de détail: Affiche les détails d'un track et le lecteur
 * - Affiche les infos complètes du track
 * - Contrôles de lecture (play, pause, volume, etc.)
 * - Affichage des paroles (lyrics) via API externe
 */
@Component({
  selector: 'app-track-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DurationPipe],
  templateUrl: './track-detail.component.html',
  styleUrls: ['./track-detail.component.css']
})
export class TrackDetailComponent implements OnInit, OnDestroy {
  track: Track | null = null;
  trackId: string | null = null;
  playerState$: Observable<AudioPlayerState>;
  Math = Math;

  // Lyrics
  lyrics: LyricsResult | null = null;
  lyricsLoading = false;
  lyricsError: string | null = null;
  showLyrics = false;

  private lyricsSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trackService: TrackService,
    private audioPlayerService: AudioPlayerService,
    private lyricsService: LyricsService,
    private indexedDbStorage: IndexedDbStorageService
  ) {
    this.playerState$ = this.audioPlayerService.playerState$;
  }

  ngOnInit(): void {
    // Récupérer l'ID du track depuis les paramètres de route
    this.route.paramMap.subscribe((params) => {
      this.trackId = params.get('id');
      if (this.trackId) {
        this.loadTrack();
      }
    });
  }

  ngOnDestroy(): void {
    this.lyricsSubscription?.unsubscribe();
    this.lyricsService.clearLyrics();
  }

  /**
   * Charge le track depuis le service
   */
  private loadTrack(): void {
    if (this.trackId) {
      this.trackService.getTrackById(this.trackId).subscribe(
        (track) => {
          this.track = track || null;
          if (!track) {
            console.warn('Track not found with ID:', this.trackId);
          }
        },
        (error) => {
          console.error('Error loading track:', error);
          this.track = null;
        }
      );
    }
  }

  /**
   * Lance la lecture du track
   * Essaie d'abord de récupérer l'audio depuis IndexedDB
   */
  async playTrack(): Promise<void> {
    if (!this.track) return;

    try {
      // Essayer d'abord de récupérer depuis IndexedDB
      let audioUrl = await this.indexedDbStorage.getAudioFile(this.track.id);
      
      // Si pas dans IndexedDB, utiliser le filePath du track
      if (!audioUrl && this.track.filePath) {
        audioUrl = this.track.filePath;
      }

      if (audioUrl) {
        this.trackService.incrementPlays(this.track.id);
        this.audioPlayerService.play(audioUrl);
      } else {
        console.warn('No audio file available for this track');
      }
    } catch (err) {
      console.error('Error playing track:', err);
    }
  }

  /**
   * Met en pause la lecture
   */
  pauseTrack(): void {
    this.audioPlayerService.pause();
  }

  /**
   * Arrête la lecture
   */
  stopTrack(): void {
    this.audioPlayerService.stop();
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
   * Charge les paroles du track
   */
  loadLyrics(): void {
    if (!this.track) return;

    this.lyricsLoading = true;
    this.lyricsError = null;
    this.showLyrics = true;

    this.lyricsSubscription = this.lyricsService
      .getLyrics(this.track.artist, this.track.title)
      .subscribe({
        next: (result) => {
          this.lyrics = result;
          this.lyricsLoading = false;
          if (!result) {
            this.lyricsError = this.lyricsService.error();
          }
        },
        error: (err) => {
          console.error('Error loading lyrics:', err);
          this.lyricsLoading = false;
          this.lyricsError = 'Erreur lors du chargement des paroles';
        }
      });
  }

  /**
   * Ferme la section des paroles
   */
  closeLyrics(): void {
    this.showLyrics = false;
    this.lyrics = null;
    this.lyricsError = null;
    this.lyricsService.clearLyrics();
  }

  /**
   * Revient à la liste des tracks
   */
  goBack(): void {
    this.router.navigate(['/library']);
  }
}
