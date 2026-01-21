import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Track, TrackState } from '../models/track.model';
import { StorageService } from './storage.service';

/**
 * Service pour gérer les opérations CRUD des tracks
 * 
 * Utilise:
 * - StorageService pour la persistence avec localStorage
 * - BehaviorSubject pour la réactivité
 * - Logique simple et lisible pour débutant
 */
@Injectable({
  providedIn: 'root',
})
export class TrackService {
  // État initial du service (créé à partir du localStorage)
  private initialState: TrackState = {
    tracks: [],
    loading: false,
    error: null,
    success: false,
  };

  // BehaviorSubject pour gérer l'état réactif
  private trackState = new BehaviorSubject<TrackState>(this.initialState);
  public tracks$ = this.trackState.asObservable();

  /**
   * Injecter le StorageService
   */
  constructor(private storageService: StorageService) {
    // Charger les tracks depuis localStorage
    this.loadTracksFromStorage();
    console.log('TrackService initialized');
  }

  /**
   * Charger les tracks depuis le StorageService
   */
  private loadTracksFromStorage(): void {
    const tracks = this.storageService.getTracks();
    this.trackState.next({
      tracks,
      loading: false,
      error: null,
      success: true,
    });
  }

  /**
   * Récupère la liste de tous les tracks
   */
  getTracks(): Observable<Track[]> {
    return new Observable((observer) => {
      observer.next(this.trackState.value.tracks);
      observer.complete();
    });
  }

  /**
   * Ajoute un nouveau track
   * @param track - Le track à ajouter
   */
  addTrack(track: Track): void {
    // Ajouter dans le storage
    this.storageService.addTrack(track);

    // Mettre à jour l'état local
    const currentState = this.trackState.value;
    const updatedTracks = [...currentState.tracks, track];
    this.trackState.next({
      ...currentState,
      tracks: updatedTracks,
      success: true,
      error: null,
    });
  }

  /**
   * Met à jour un track existant
   * @param trackId - ID du track à mettre à jour
   * @param updatedTrack - Les données mises à jour
   */
  updateTrack(trackId: string, updatedTrack: Partial<Track>): void {
    // Mettre à jour dans le storage
    this.storageService.updateTrack(trackId, updatedTrack);

    // Mettre à jour l'état local
    const currentState = this.trackState.value;
    const updated = currentState.tracks.map((track) =>
      track.id === trackId ? { ...track, ...updatedTrack } : track
    );
    this.trackState.next({
      ...currentState,
      tracks: updated,
      success: true,
      error: null,
    });
  }

  /**
   * Supprime un track
   * @param trackId - ID du track à supprimer
   */
  deleteTrack(trackId: string): void {
    // Supprimer du storage
    this.storageService.deleteTrack(trackId);

    // Mettre à jour l'état local
    const currentState = this.trackState.value;
    const updatedTracks = currentState.tracks.filter(
      (track) => track.id !== trackId
    );
    this.trackState.next({
      ...currentState,
      tracks: updatedTracks,
      success: true,
      error: null,
    });
  }

  /**
   * Recherche des tracks par titre
   * @param searchTerm - Le terme de recherche
   */
  searchTracks(searchTerm: string): Observable<Track[]> {
    return new Observable((observer) => {
      const results = this.trackState.value.tracks.filter((track) =>
        track.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      observer.next(results);
      observer.complete();
    });
  }

  /**
   * Filtre les tracks par catégorie
   * @param category - La catégorie à filtrer
   */
  filterByCategory(
    category: Track['category']
  ): Observable<Track[]> {
    return new Observable((observer) => {
      const results = this.trackState.value.tracks.filter(
        (track) => track.category === category
      );
      observer.next(results);
      observer.complete();
    });
  }

  /**
   * Récupère un track par son ID
   * @param trackId - L'ID du track à récupérer
   */
  getTrackById(trackId: string): Observable<Track | undefined> {
    return new Observable((observer) => {
      const track = this.trackState.value.tracks.find(
        (t) => t.id === trackId
      );
      observer.next(track);
      observer.complete();
    });
  }

  /**
   * Marque une piste comme aimée
   * @param trackId - L'ID du track à liker
   */
  likeTrack(trackId: string): void {
    this.updateTrack(trackId, { liked: true });
  }

  /**
   * Enlève le like d'une piste
   * @param trackId - L'ID du track
   */
  unlikeTrack(trackId: string): void {
    this.updateTrack(trackId, { liked: false });
  }

  /**
   * Incrémente le compteur de lectures
   * @param trackId - L'ID du track
   */
  incrementPlays(trackId: string): void {
    const track = this.trackState.value.tracks.find(t => t.id === trackId);
    if (track) {
      this.updateTrack(trackId, { plays: (track.plays || 0) + 1 });
    }
  }

  /**
   * Génère un ID unique pour les tracks
   */
  private generateId(): string {
    return `track-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
}
