import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackCardComponent } from '../components/track-card.component';
import { TrackService } from '../services/track.service';
import { AudioPlayerService } from '../services/audio-player.service';
import { Track, TRACK_VALIDATION } from '../models/track.model';
import { Observable } from 'rxjs';

/**
 * Page principale: Affiche la liste de tous les tracks
 * - Affiche les tracks
 * - Permet la recherche et le filtrage
 * - Gère les likes et lectures
 */
@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule, TrackCardComponent],
  templateUrl: './library.component.html',
  styleUrl: './library.component.css'
})
export class LibraryComponent implements OnInit {
  tracks$: Observable<Track[]>;
  searchTerm: string = '';
  categories = TRACK_VALIDATION.CATEGORIES;
  selectedCategory: Track['category'] | 'all' = 'all';

  constructor(
    private trackService: TrackService,
    private audioPlayerService: AudioPlayerService
  ) {
    this.tracks$ = this.trackService.getTracks();
  }

  ngOnInit(): void {
    console.log('LibraryComponent initialized');
  }

  /**
   * Effectue une recherche de tracks
   */
  searchTracks(): void {
    if (this.searchTerm.trim()) {
      this.tracks$ = this.trackService.searchTracks(this.searchTerm);
    } else {
      this.loadTracks();
    }
  }

  /**
   * Filtre les tracks par catégorie
   */
  filterByCategory(category: Track['category'] | 'all'): void {
    this.selectedCategory = category;
    if (category === 'all') {
      this.loadTracks();
    } else {
      this.tracks$ = this.trackService.filterByCategory(category);
    }
  }

  /**
   * Réinitialise les filtres
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.loadTracks();
  }

  /**
   * Charge tous les tracks
   */
  private loadTracks(): void {
    this.tracks$ = this.trackService.getTracks();
  }

  /**
   * Gère l'événement de lecture d'un track
   */
  onPlayTrack(track: Track): void {
    if (track.filePath) {
      console.log('Playing:', track.title);
      this.trackService.incrementPlays(track.id);
      this.audioPlayerService.play(track.filePath);
    } else {
      console.warn('Track has no audio file:', track.title);
    }
  }

  /**
   * Gère la suppression d'un track
   */
  onDeleteTrack(track: Track): void {
    console.log('Deleting:', track.title);
    this.trackService.deleteTrack(track.id);
    this.loadTracks();
  }

  /**
   * Gère l'ajout d'un like
   */
  onLikeTrack(track: Track): void {
    this.trackService.likeTrack(track.id);
  }

  /**
   * Gère la suppression d'un like
   */
  onUnlikeTrack(track: Track): void {
    this.trackService.unlikeTrack(track.id);
  }
}
