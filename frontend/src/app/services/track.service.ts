import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Track, TrackState, LoadingState } from '../models/track.model';
import { StorageService } from './storage.service';
import { IndexedDbStorageService } from './indexed-db-storage.service';
import { ApiService } from './backend/api.service';
import { SongTrackAdapter } from './backend/song-track.adapter';

/**
 * TrackService - Service pour gérer les opérations CRUD des tracks
 * 
 * Architecture:
 * - BehaviorSubject pour l'état réactif (compatible RxJS)
 * - Signals pour les états de chargement (Angular 17+)
 * - API REST comme source principale
 * - localStorage/IndexedDB comme fallback
 * 
 * États gérés:
 * - loading: Opération en cours
 * - error: Message d'erreur
 * - success: Opération réussie
 * - loadingState: État granulaire (idle, loading, success, error)
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
    loadingState: 'idle',
  };

  // BehaviorSubject pour l'état complet (réactivité RxJS)
  private trackState = new BehaviorSubject<TrackState>(this.initialState);

  // Observable public pour les composants
  public trackState$ = this.trackState.asObservable();

  // Observable pour les tracks seuls (raccourci)
  public tracks$ = this.trackState$.pipe(map(state => state.tracks));

  // Signals pour les états (Angular 17+)
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public success = signal<boolean>(false);
  public loadingState = signal<LoadingState>('idle');

  // Signal computed pour le nombre de tracks
  public trackCount = computed(() => this.trackState.value.tracks.length);

  constructor(
    private storageService: StorageService,
    private indexedDbStorage: IndexedDbStorageService,
    private apiService: ApiService
  ) {
    // Charger les tracks au démarrage
    this.loadTracksFromApi();
    console.log('TrackService initialized with API + IndexedDB support');
  }

  /**
   * Charger les tracks depuis l'API REST
   * Fallback au localStorage si l'API n'est pas disponible
   */
  private loadTracksFromApi(): void {
    this.setLoadingState(true);

    this.apiService.getAllTracks().subscribe({
      next: (songs: any[]) => {
        const tracks = SongTrackAdapter.songsToTracks(songs);
        this.updateState({
          tracks,
          loading: false,
          success: true,
          error: null,
        });
        console.log(`Loaded ${tracks.length} tracks from API`);
      },
      error: (err) => {
        console.warn('API not available, using localStorage fallback', err);
        this.loadTracksFromStorage();
      },
    });
  }

  /**
   * Charger les tracks depuis le localStorage (fallback)
   */
  private loadTracksFromStorage(): void {
    try {
      const tracks = this.storageService.getTracks();
      this.updateState({
        tracks,
        loading: false,
        success: true,
        error: null,
        loadingState: 'success',
      });
      console.log(`Loaded ${tracks.length} tracks from localStorage`);
    } catch (err) {
      this.setErrorState('Erreur lors du chargement des tracks');
    }
  }

  /**
   * Met à jour l'état du service
   */
  private updateState(partial: Partial<TrackState>): void {
    const currentState = this.trackState.value;
    const newState = { ...currentState, ...partial };
    this.trackState.next(newState);

    // Synchroniser avec les Signals
    if (partial.loading !== undefined) this.loading.set(partial.loading);
    if (partial.error !== undefined) this.error.set(partial.error);
    if (partial.success !== undefined) this.success.set(partial.success);
    if (partial.loadingState !== undefined) this.loadingState.set(partial.loadingState);
  }

  /**
   * Définit l'état de chargement
   */
  private setLoadingState(isLoading: boolean): void {
    this.updateState({ 
      loading: isLoading, 
      error: null, 
      success: false,
      loadingState: isLoading ? 'loading' : 'idle'
    });
  }

  /**
   * Définit l'état d'erreur
   */
  private setErrorState(errorMessage: string): void {
    this.updateState({ 
      loading: false, 
      error: errorMessage, 
      success: false,
      loadingState: 'error'
    });
  }

  /**
   * Définit l'état de succès
   */
  private setSuccessState(): void {
    this.updateState({ 
      loading: false, 
      error: null, 
      success: true,
      loadingState: 'success'
    });

    // Réinitialiser le succès après 3 secondes
    setTimeout(() => {
      this.success.set(false);
      this.loadingState.set('idle');
    }, 3000);
  }

  /**
   * Récupère la liste de tous les tracks (snapshot)
   */
  getTracks(): Observable<Track[]> {
    return this.tracks$;
  }

  /**
   * Récupère l'état complet du service
   */
  getState(): Observable<TrackState> {
    return this.trackState$;
  }

  /**
   * Rafraîchit la liste des tracks depuis l'API
   */
  refreshTracks(): void {
    this.loadTracksFromApi();
  }

  /**
   * Ajoute un nouveau track
   * @param track - Le track à ajouter
   * @param audioFile - Le fichier audio optionnel
   * @param coverImage - L'image de couverture optionnelle
   * @returns Promise qui se résout quand l'ajout est terminé
   */
  async addTrack(track: Track, audioFile?: File, coverImage?: File): Promise<Track> {
    this.setLoadingState(true);

    try {
      // Stocker le fichier audio dans IndexedDB si fourni
      if (audioFile) {
        const blobUrl = await this.indexedDbStorage.storeAudioFile(track.id, audioFile);
        track.filePath = blobUrl;
        track.fileSize = audioFile.size;
      }

      // Stocker l'image de couverture dans IndexedDB si fournie
      if (coverImage) {
        const coverBlobUrl = await this.indexedDbStorage.storeCoverImage(track.id, coverImage);
        track.coverImage = coverBlobUrl;
        track.coverImageSize = coverImage.size;
      }

      // Convertir Track en Song pour l'API
      const song = SongTrackAdapter.trackToSong(track);

      // Envoyer à l'API et attendre la réponse
      return new Promise<Track>((resolve, reject) => {
        this.apiService.createTrack(song).subscribe({
          next: (createdSong: any) => {
            const newTrack = SongTrackAdapter.songToTrack(createdSong);

            // Si on a un fichier audio local, garder l'URL blob
            if (audioFile) {
              newTrack.filePath = track.filePath;
              newTrack.fileSize = track.fileSize;
            }

            // Si on a une image de couverture locale, garder l'URL blob
            if (coverImage) {
              newTrack.coverImage = track.coverImage;
              newTrack.coverImageSize = track.coverImageSize;
            }

            // Sauvegarder aussi dans localStorage (fallback)
            this.storageService.addTrack(newTrack);

            // Mettre à jour l'état
            const currentTracks = this.trackState.value.tracks;
            this.updateState({
              tracks: [...currentTracks, newTrack],
              loading: false,
              success: true,
              error: null,
            });

            this.setSuccessState();
            console.log('Track created:', newTrack.title);
            resolve(newTrack);
          },
          error: (err) => {
            console.error('API error, saving locally:', err);
            this.saveTrackLocally(track);
            resolve(track); // Resolve avec le track local
          },
        });
      });
    } catch (err: any) {
      this.setErrorState(err.message || 'Erreur lors de l\'ajout du track');
      throw err;
    }
  }

  /**
   * Sauvegarde un track localement (fallback)
   */
  private saveTrackLocally(track: Track): void {
    this.storageService.addTrack(track);
    const currentTracks = this.trackState.value.tracks;
    this.updateState({
      tracks: [...currentTracks, track],
      loading: false,
      success: true,
      error: null,
    });
    this.setSuccessState();
    console.log('Track saved locally:', track.title);
  }

  /**
   * Met à jour un track existant
   * @param trackId - ID du track à mettre à jour
   * @param updatedTrack - Les données mises à jour
   * @returns Promise qui se résout quand la mise à jour est terminée
   */
  async updateTrack(trackId: string, updatedTrack: Partial<Track>): Promise<Track> {
    this.setLoadingState(true);

    // Récupérer le track complet
    const fullTrack = this.trackState.value.tracks.find(t => t.id === trackId);
    if (!fullTrack) {
      this.setErrorState('Track non trouvé');
      throw new Error('Track non trouvé');
    }

    const mergedTrack = { ...fullTrack, ...updatedTrack };
    
    // Vérifier si l'ID est numérique (vient de l'API) ou string (créé localement)
    const numericId = Number(trackId);
    const isApiTrack = !isNaN(numericId) && numericId > 0;

    return new Promise<Track>((resolve, reject) => {
      if (isApiTrack) {
        // Track de l'API : mettre à jour via l'API
        const song = SongTrackAdapter.trackToSong(mergedTrack);

        this.apiService.updateTrack(trackId, song).subscribe({
          next: () => {
            this.finalizeUpdate(trackId, updatedTrack);
            resolve(mergedTrack);
          },
          error: (err) => {
            console.error('Error updating track via API:', err);
            // Fallback: mettre à jour localement
            this.finalizeUpdate(trackId, updatedTrack, 'Mise à jour locale uniquement (API indisponible)');
            resolve(mergedTrack);
          },
        });
      } else {
        // Track local : mettre à jour uniquement en local
        this.finalizeUpdate(trackId, updatedTrack);
        resolve(mergedTrack);
      }
    });
  }

  /**
   * Finalise la mise à jour d'un track (local + state)
   */
  private finalizeUpdate(trackId: string, updatedTrack: Partial<Track>, errorMsg?: string): void {
    // Mettre à jour dans le localStorage
    this.storageService.updateTrack(trackId, updatedTrack);

    // Mettre à jour l'état
    const updated = this.trackState.value.tracks.map((track) =>
      track.id === trackId ? { ...track, ...updatedTrack } : track
    );
    
    this.updateState({
      tracks: updated,
      loading: false,
      success: !errorMsg,
      error: errorMsg || null,
    });
    
    if (!errorMsg) {
      this.setSuccessState();
    }
    console.log('Track updated:', trackId);
  }

  /**
   * Supprime un track
   * @param trackId - ID du track à supprimer
   * @returns Promise qui se résout quand la suppression est terminée
   */
  async deleteTrack(trackId: string): Promise<void> {
    this.setLoadingState(true);

    try {
      // Supprimer tous les fichiers associés au track (audio + image) dans IndexedDB
      await this.indexedDbStorage.deleteAllTrackFiles(trackId);
    } catch (err) {
      console.warn('No files to delete or error:', err);
    }

    return new Promise<void>((resolve) => {
      this.apiService.deleteTrack(trackId).subscribe({
        next: () => {
          // Supprimer du localStorage aussi
          this.storageService.deleteTrack(trackId);

          // Mettre à jour l'état
          const updatedTracks = this.trackState.value.tracks.filter(
            (track) => track.id !== trackId
          );
          this.updateState({
            tracks: updatedTracks,
            loading: false,
            success: true,
            error: null,
          });
          this.setSuccessState();
          console.log('Track deleted:', trackId);
          resolve();
        },
        error: (err) => {
          console.error('Error deleting track:', err);
          // Fallback: supprimer du localStorage quand même
          this.storageService.deleteTrack(trackId);

          const updatedTracks = this.trackState.value.tracks.filter(
            (track) => track.id !== trackId
          );
          this.updateState({
            tracks: updatedTracks,
            loading: false,
            error: 'Suppression locale uniquement (API indisponible)',
          });
          resolve();
        },
      });
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
  filterByCategory(category: Track['category']): Observable<Track[]> {
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
      const track = this.trackState.value.tracks.find((t) => t.id === trackId);
      observer.next(track);
      observer.complete();
    });
  }

  /**
   * Récupère l'URL audio pour un track (depuis IndexedDB si disponible)
   */
  async getAudioUrl(trackId: string): Promise<string | null> {
    try {
      const blobUrl = await this.indexedDbStorage.getAudioFile(trackId);
      if (blobUrl) return blobUrl;

      // Fallback: chercher dans le track
      const track = this.trackState.value.tracks.find(t => t.id === trackId);
      return track?.filePath || null;
    } catch (err) {
      console.error('Error getting audio URL:', err);
      return null;
    }
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
  generateId(): string {
    return `track-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Efface l'erreur courante
   */
  clearError(): void {
    this.error.set(null);
    this.updateState({ error: null });
  }
}
