import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TrackCardComponent } from '../components/track-card.component';
import { TrackService } from '../services/track.service';
import { AudioPlayerService } from '../services/audio-player.service';
import { StorageService } from '../services/storage.service';
import { Track, TrackState, TRACK_VALIDATION } from '../models/track.model';
import { Subscription } from 'rxjs';

/**
 * LibraryComponent - Page principale de la bibliothèque de musique
 * 
 * Fonctionnalités:
 * - Affichage de tous les tracks avec images de couverture
 * - Recherche par titre ou artiste
 * - Filtrage par catégorie
 * - Drag & Drop pour réorganiser les tracks
 * - États de chargement et erreurs
 * - Gestion des likes et lectures
 */
@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TrackCardComponent],
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit, OnDestroy {
  // État de la bibliothèque
  tracks: Track[] = [];
  filteredTracks: Track[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  // Filtres
  searchTerm: string = '';
  selectedCategory: Track['category'] | 'all' = 'all';
  categories = TRACK_VALIDATION.CATEGORIES;

  // Subscription pour le nettoyage
  private stateSubscription?: Subscription;

  constructor(
    private trackService: TrackService,
    private audioPlayerService: AudioPlayerService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.subscribeToState();
    console.log('LibraryComponent initialized');
  }

  ngOnDestroy(): void {
    // Nettoyer les subscriptions
    this.stateSubscription?.unsubscribe();
  }

  /**
   * S'abonner à l'état du TrackService
   */
  private subscribeToState(): void {
    this.stateSubscription = this.trackService.getState().subscribe({
      next: (state: TrackState) => {
        this.tracks = state.tracks;
        this.isLoading = state.loading;
        this.errorMessage = state.error;
        this.applyFilters();
      },
      error: (err) => {
        console.error('Error subscribing to track state:', err);
        this.errorMessage = 'Erreur lors du chargement des tracks';
      }
    });
  }

  /**
   * Appliquer les filtres (recherche + catégorie)
   */
  private applyFilters(): void {
    let result = [...this.tracks];

    // Filtre par recherche
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(track =>
        track.title.toLowerCase().includes(term) ||
        track.artist.toLowerCase().includes(term)
      );
    }

    // Filtre par catégorie
    if (this.selectedCategory !== 'all') {
      result = result.filter(track => track.category === this.selectedCategory);
    }

    this.filteredTracks = result;
  }

  /**
   * Effectue une recherche de tracks
   */
  searchTracks(): void {
    this.applyFilters();
  }

  /**
   * Filtre les tracks par catégorie
   */
  filterByCategory(category: Track['category'] | 'all'): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  /**
   * Réinitialise les filtres
   */
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.applyFilters();
  }

  /**
   * Rafraîchit la liste des tracks
   */
  refreshTracks(): void {
    this.trackService.refreshTracks();
  }

  /**
   * Gère l'événement de lecture d'un track
   */
  onPlayTrack(track: Track): void {
    if (track.filePath) {
      console.log('Playing:', track.title);
      this.trackService.incrementPlays(track.id);
      this.audioPlayerService.play(track.filePath, track.id);
    } else {
      console.warn('Track has no audio file:', track.title);
    }
  }

  /**
   * Gère la suppression d'un track
   */
  onDeleteTrack(track: Track): void {
    if (confirm(`Voulez-vous vraiment supprimer "${track.title}" ?`)) {
      console.log('Deleting:', track.title);
      this.trackService.deleteTrack(track.id);
    }
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

  /**
   * Efface le message d'erreur
   */
  clearError(): void {
    this.trackService.clearError();
  }

  /**
   * Gère le réordonnement des tracks via drag & drop
   * @param event - L'événement de réordonnement contenant le track cible et l'ID du track déplacé
   */
  onReorderTrack(event: { track: Track, targetId: string }): void {
    const { track: targetTrack, targetId: draggedTrackId } = event;
    
    // Trouver les indices
    const draggedIndex = this.filteredTracks.findIndex(t => t.id === draggedTrackId);
    const targetIndex = this.filteredTracks.findIndex(t => t.id === targetTrack.id);
    
    if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
      return;
    }
    
    // Réorganiser le tableau
    const newTracks = [...this.filteredTracks];
    const [draggedTrack] = newTracks.splice(draggedIndex, 1);
    newTracks.splice(targetIndex, 0, draggedTrack);
    
    // Mettre à jour l'ordre
    newTracks.forEach((track, index) => {
      track.order = index;
    });
    
    this.filteredTracks = newTracks;
    
    // Sauvegarder le nouvel ordre
    const trackIds = newTracks.map(t => t.id);
    this.storageService.saveTrackOrder(trackIds);
    
    console.log('Tracks reordered:', trackIds);
  }
}
