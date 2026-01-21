import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Track, TrackState } from '../models/track.model';

/**
 * Service pour gérer les opérations CRUD des tracks
 * Utilise RxJS BehaviorSubject pour la réactivité
 */
@Injectable({
  providedIn: 'root',
})
export class TrackService {
  // Données de test
  private testTracks: Track[] = [
    {
      id: 'track-1',
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      description: 'Un chef-d\'œuvre classique du rock',
      category: 'rock',
      duration: 354,
      addedDate: new Date('2025-01-01'),
      filePath: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    {
      id: 'track-2',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      description: 'Hit pop moderne',
      category: 'pop',
      duration: 200,
      addedDate: new Date('2025-01-05'),
      filePath: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    },
    {
      id: 'track-3',
      title: 'Lose Yourself',
      artist: 'Eminem',
      description: 'Classique du hip-hop',
      category: 'rap',
      duration: 326,
      addedDate: new Date('2025-01-10'),
      filePath: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    },
    {
      id: 'track-4',
      title: 'Midnight City',
      artist: 'M83',
      description: 'Synthwave électronique',
      category: 'electronic',
      duration: 244,
      addedDate: new Date('2025-01-08'),
      filePath: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    },
    {
      id: 'track-5',
      title: 'Take Five',
      artist: 'Dave Brubeck',
      description: 'Jazz classique intemporel',
      category: 'jazz',
      duration: 324,
      addedDate: new Date('2025-01-03'),
      filePath: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    },
    {
      id: 'track-6',
      title: 'Stairway to Heaven',
      artist: 'Led Zeppelin',
      description: 'Un classique du rock progressive',
      category: 'rock',
      duration: 482,
      addedDate: new Date('2025-01-02'),
      filePath: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    },
  ];

  // État initial du service
  private initialState: TrackState = {
    tracks: this.testTracks,
    loading: false,
    error: null,
    success: false,
  };

  // BehaviorSubject pour gérer l'état réactif
  private trackState = new BehaviorSubject<TrackState>(this.initialState);
  public tracks$ = this.trackState.asObservable();

  constructor() {
    console.log('TrackService initialized with', this.testTracks.length, 'test tracks');
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
    const currentState = this.trackState.value;
    const newTrack: Track = {
      ...track,
      id: this.generateId(),
    };
    const updatedTracks = [...currentState.tracks, newTrack];
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
    const currentState = this.trackState.value;
    const updatedTracks = currentState.tracks.map((track) =>
      track.id === trackId ? { ...track, ...updatedTrack } : track
    );
    this.trackState.next({
      ...currentState,
      tracks: updatedTracks,
      success: true,
      error: null,
    });
  }

  /**
   * Supprime un track
   * @param trackId - ID du track à supprimer
   */
  deleteTrack(trackId: string): void {
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
