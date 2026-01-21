import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TrackService } from '../services/track.service';
import { AudioPlayerService } from '../services/audio-player.service';
import { Track } from '../models/track.model';

/**
 * Page de détail: Affiche les détails d'un track et le lecteur
 * - Affiche les infos complètes du track
 * - Contrôles de lecture (play, pause, volume, etc.)
 */
@Component({
  selector: 'app-track-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './track-detail.component.html',
  styleUrl: './track-detail.component.css'
})
export class TrackDetailComponent implements OnInit {
  track: Track | null = null;
  trackId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private trackService: TrackService,
    private audioPlayerService: AudioPlayerService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID du track depuis les paramètres de route
    this.route.paramMap.subscribe((params) => {
      this.trackId = params.get('id');
      if (this.trackId) {
        this.loadTrack();
      }
    });
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
   */
  playTrack(): void {
    if (this.track?.filePath) {
      this.audioPlayerService.play(this.track.filePath);
    }
  }

  /**
   * Revient à la liste des tracks
   */
  goBack(): void {
    this.router.navigate(['/library']);
  }
}
