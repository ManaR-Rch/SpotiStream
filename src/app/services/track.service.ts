import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Track, TrackState } from '../models/track.model';
import { StorageService } from './storage.service';
import { ApiService } from './backend/api.service';
import { SongTrackAdapter } from './backend/song-track.adapter';

/**
 * Service pour gérer les opérations CRUD des tracks
 * 
 * NOUVELLE APPROCHE (Étape 6):
 * - Utilise l'API REST Spring Boot (http://localhost:8080/api)
 * - Garde le localStorage comme fallback
 * - Utilise BehaviorSubject pour la réactivité
 * 
 * Avantages:
 * ✅ Les données sont sauvegardées en base de données
 * ✅ Les données persistent entre les sessions
 * ✅ Partage les données entre plusieurs utilisateurs (plus tard avec auth)
 * ✅ Fallback au localStorage si l'API n'est pas disponible
 */
@Injectable({
  providedIn: 'root',
})
export class TrackService {
  // État initial du service
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
   * Injecter les services
   */
  constructor(
    private storageService: StorageService,
    private apiService: ApiService
  ) {
    // Charger les tracks depuis l'API (ou fallback au localStorage)
    this.loadTracksFromApi();
    console.log('TrackService initialized with API');
  }

  /**
   * Charger les tracks depuis l'API REST
   * Si l'API n'est pas disponible, fallback au localStorage
   */
  private loadTracksFromApi(): void {
    this.updateState({ loading: true });

    this.apiService.getAllTracks().subscribe({
      next: (songs: any[]) => {
        // Convertir Song (API) en Track (Frontend)
        const tracks = SongTrackAdapter.songsToTracks(songs);
        this.updateState({
          tracks,
          loading: false,
          success: true,
          error: null,
        });
        console.log(`Loaded ${tracks.length} tracks from API`);
      },
      error: (error) => {
        console.warn('API not available, using localStorage fallback', error);
        // Fallback au localStorage
        this.loadTracksFromStorage();
      },
    });
  }

  /**
   * Charger les tracks depuis le StorageService (fallback)
   */
  private loadTracksFromStorage(): void {
    const tracks = this.storageService.getTracks();
    this.updateState({
      tracks,
      loading: false,
      success: true,
      error: null,
    });
    console.log(`Loaded ${tracks.length} tracks from localStorage`);
  }

  /**
   * Mettre à jour l'état du service
   */
  private updateState(partial: Partial<TrackState>): void {
    const currentState = this.trackState.value;
    this.trackState.next({ ...currentState, ...partial });
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
   * Ajoute un nouveau track via l'API
   * @param track - Le track à ajouter
   */
  addTrack(track: Track): void {
    this.updateState({ loading: true });

    // Convertir Track (Frontend) en Song (API)
    const song = SongTrackAdapter.trackToSong(track);

    this.apiService.createTrack(song).subscribe({
      next: (createdSong: any) => {
        // Convertir la réponse en Track
        const newTrack = SongTrackAdapter.songToTrack(createdSong);
        
        // Ajouter également au localStorage (fallback)
        this.storageService.addTrack(newTrack);

        // Mettre à jour l'état
        const currentState = this.trackState.value;
        const updatedTracks = [...currentState.tracks, newTrack];
        this.updateState({
          tracks: updatedTracks,
          loading: false,
          success: true,
          error: null,
        });
        console.log('Track created:', newTrack);
      },
      error: (error) => {
        console.error('Error creating track:', error);
        // Fallback: ajouter au localStorage quand même
        this.storageService.addTrack(track);
        
        const currentState = this.trackState.value;
        const updatedTracks = [...currentState.tracks, track];
        this.updateState({
          tracks: updatedTracks,
          loading: false,
          error: error.message,
        });
      },
    });
  }

  /**
   * Met à jour un track existant via l'API
   * @param trackId - ID du track à mettre à jour
   * @param updatedTrack - Les données mises à jour
   */
  updateTrack(trackId: string, updatedTrack: Partial<Track>): void {
    this.updateState({ loading: true });

    // Récupérer le track complet
    const fullTrack = this.trackState.value.tracks.find(t => t.id === trackId);
    if (!fullTrack) {
      this.updateState({ 
        loading: false, 
        error: 'Track not found' 
      });
      return;
    }

    const mergedTrack = { ...fullTrack, ...updatedTrack };
    const song = SongTrackAdapter.trackToSong(mergedTrack);

    this.apiService.updateTrack(trackId, song).subscribe({
      next: () => {
        // Mettre à jour dans le localStorage
        this.storageService.updateTrack(trackId, updatedTrack);

        // Mettre à jour l'état
        const currentState = this.trackState.value;
        const updated = currentState.tracks.map((track) =>
          track.id === trackId ? { ...track, ...updatedTrack } : track
        );
        this.updateState({
          tracks: updated,
          loading: false,
          success: true,
          error: null,
        });
        console.log('Track updated:', trackId);
      },
      error: (error) => {
        console.error('Error updating track:', error);
        // Fallback: mettre à jour le localStorage quand même
        this.storageService.updateTrack(trackId, updatedTrack);

        const currentState = this.trackState.value;
        const updated = currentState.tracks.map((track) =>
          track.id === trackId ? { ...track, ...updatedTrack } : track
        );
        this.updateState({
          tracks: updated,
          loading: false,
          error: error.message,
        });
      },
    });
  }

  /**
   * Supprime un track via l'API
   * @param trackId - ID du track à supprimer
   */
  deleteTrack(trackId: string): void {
    this.updateState({ loading: true });

    this.apiService.deleteTrack(trackId).subscribe({
      next: () => {
        // Supprimer du localStorage aussi
        this.storageService.deleteTrack(trackId);

        // Mettre à jour l'état
        const currentState = this.trackState.value;
        const updatedTracks = currentState.tracks.filter(
          (track) => track.id !== trackId
        );
        this.updateState({
          tracks: updatedTracks,
          loading: false,
          success: true,
          error: null,
        });
        console.log('Track deleted:', trackId);
      },
      error: (error) => {
        console.error('Error deleting track:', error);
        // Fallback: supprimer du localStorage quand même
        this.storageService.deleteTrack(trackId);

        const currentState = this.trackState.value;
        const updatedTracks = currentState.tracks.filter(
          (track) => track.id !== trackId
        );
        this.updateState({
          tracks: updatedTracks,
          loading: false,
          error: error.message,
        });
      },
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
