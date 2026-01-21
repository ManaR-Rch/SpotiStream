import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackCardComponent } from '../components/track-card.component';
import { TrackService } from '../services/track.service';
import { AudioPlayerService } from '../services/audio-player.service';
import { Track } from '../models/track.model';
import { Observable } from 'rxjs';

/**
 * Page principale: Affiche la liste de tous les tracks
 * - Affiche les tracks
 * - Permet la recherche et le filtrage
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
      this.tracks$ = this.trackService.getTracks();
    }
  }

  /**
   * Filtre les tracks par catégorie
   */
  filterByCategory(category: Track['category']): void {
    this.tracks$ = this.trackService.filterByCategory(category);
  }

  /**
   * Gère l'événement de lecture d'un track
   */
  onPlayTrack(track: Track): void {
    if (track.filePath) {
      console.log('Playing:', track.title);
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
    this.tracks$ = this.trackService.getTracks();
  }
}
