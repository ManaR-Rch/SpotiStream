import { Injectable, signal } from '@angular/core';
import { Track, LoadingState, ValidationResult } from '../models/track.model';

/**
 * StorageService - Service pour gérer localStorage avec gestion d'erreurs robuste
 * 
 * Responsabilités:
 * - Sauvegarder les tracks dans localStorage
 * - Récupérer les tracks depuis localStorage
 * - Mettre à jour et supprimer les tracks
 * - Gestion des erreurs de lecture/écriture
 * - Interface uniforme pour les opérations de persistance
 * 
 * États réactifs avec Signals:
 * - loadingState: 'idle' | 'loading' | 'success' | 'error'
 * - error: Message d'erreur ou null
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  // Clé pour accéder aux données dans localStorage
  private readonly STORAGE_KEY = 'music_tracks';
  private readonly TRACK_ORDER_KEY = 'music_tracks_order';

  // Signals pour les états réactifs (Angular 17+)
  public loadingState = signal<LoadingState>('idle');
  public error = signal<string | null>(null);
  public lastOperation = signal<string>('');

  constructor() {
    // Initialiser le localStorage s'il est vide
    if (!this.getTracks()) {
      this.initializeDefaultTracks();
    }
  }

  /**
   * Définit l'état de chargement
   */
  private setLoadingState(state: LoadingState, errorMessage?: string): void {
    this.loadingState.set(state);
    if (state === 'error' && errorMessage) {
      this.error.set(errorMessage);
    } else if (state === 'success') {
      this.error.set(null);
    }
  }

  /**
   * Récupère tous les tracks du localStorage avec gestion d'erreurs
   * @returns Array de tracks ou tableau vide en cas d'erreur
   */
  getTracks(): Track[] {
    this.setLoadingState('loading');
    this.lastOperation.set('getTracks');
    
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const tracks = JSON.parse(data);
        this.setLoadingState('success');
        return tracks;
      }
      this.setLoadingState('success');
      return [];
    } catch (err) {
      const errorMsg = 'Erreur lors de la lecture des tracks depuis le stockage';
      console.error(errorMsg, err);
      this.setLoadingState('error', errorMsg);
      return [];
    }
  }

  /**
   * Sauvegarde un nouveau track avec validation
   * @param track - Track à ajouter
   * @returns ValidationResult indiquant le succès ou l'échec
   */
  addTrack(track: Track): ValidationResult {
    this.setLoadingState('loading');
    this.lastOperation.set('addTrack');
    
    try {
      const tracks = this.getTracks();
      
      // Vérifier si un track avec le même ID existe déjà
      const existingIndex = tracks.findIndex(t => t.id === track.id);
      if (existingIndex !== -1) {
        this.setLoadingState('error', 'Un track avec cet ID existe déjà');
        return { isValid: false, error: 'Un track avec cet ID existe déjà' };
      }
      
      tracks.push(track);
      this.saveToStorage(tracks);
      this.setLoadingState('success');
      return { isValid: true };
    } catch (err) {
      const errorMsg = 'Erreur lors de l\'ajout du track';
      console.error(errorMsg, err);
      this.setLoadingState('error', errorMsg);
      return { isValid: false, error: errorMsg };
    }
  }

  /**
   * Met à jour un track existant avec gestion d'erreurs
   * @param trackId - ID du track
   * @param updatedTrack - Données mises à jour
   * @returns ValidationResult indiquant le succès ou l'échec
   */
  updateTrack(trackId: string, updatedTrack: Partial<Track>): ValidationResult {
    this.setLoadingState('loading');
    this.lastOperation.set('updateTrack');
    
    try {
      const tracks = this.getTracks();
      const index = tracks.findIndex(t => t.id === trackId);
      
      if (index === -1) {
        const errorMsg = 'Track non trouvé';
        this.setLoadingState('error', errorMsg);
        return { isValid: false, error: errorMsg };
      }
      
      tracks[index] = { ...tracks[index], ...updatedTrack };
      this.saveToStorage(tracks);
      this.setLoadingState('success');
      return { isValid: true };
    } catch (err) {
      const errorMsg = 'Erreur lors de la mise à jour du track';
      console.error(errorMsg, err);
      this.setLoadingState('error', errorMsg);
      return { isValid: false, error: errorMsg };
    }
  }

  /**
   * Supprime un track avec gestion d'erreurs
   * @param trackId - ID du track à supprimer
   * @returns ValidationResult indiquant le succès ou l'échec
   */
  deleteTrack(trackId: string): ValidationResult {
    this.setLoadingState('loading');
    this.lastOperation.set('deleteTrack');
    
    try {
      const tracks = this.getTracks();
      const filtered = tracks.filter(t => t.id !== trackId);
      
      if (filtered.length === tracks.length) {
        const errorMsg = 'Track non trouvé';
        this.setLoadingState('error', errorMsg);
        return { isValid: false, error: errorMsg };
      }
      
      this.saveToStorage(filtered);
      this.setLoadingState('success');
      return { isValid: true };
    } catch (err) {
      const errorMsg = 'Erreur lors de la suppression du track';
      console.error(errorMsg, err);
      this.setLoadingState('error', errorMsg);
      return { isValid: false, error: errorMsg };
    }
  }

  /**
   * Sauvegarde l'ordre des tracks pour le drag & drop
   * @param trackIds - Liste des IDs dans le nouvel ordre
   */
  saveTrackOrder(trackIds: string[]): ValidationResult {
    this.setLoadingState('loading');
    this.lastOperation.set('saveTrackOrder');
    
    try {
      localStorage.setItem(this.TRACK_ORDER_KEY, JSON.stringify(trackIds));
      
      // Mettre à jour l'ordre dans les tracks eux-mêmes
      const tracks = this.getTracks();
      tracks.forEach(track => {
        const orderIndex = trackIds.indexOf(track.id);
        if (orderIndex !== -1) {
          track.order = orderIndex;
        }
      });
      this.saveToStorage(tracks);
      
      this.setLoadingState('success');
      return { isValid: true };
    } catch (err) {
      const errorMsg = 'Erreur lors de la sauvegarde de l\'ordre';
      console.error(errorMsg, err);
      this.setLoadingState('error', errorMsg);
      return { isValid: false, error: errorMsg };
    }
  }

  /**
   * Récupère l'ordre des tracks
   * @returns Liste des IDs dans l'ordre sauvegardé
   */
  getTrackOrder(): string[] {
    try {
      const data = localStorage.getItem(this.TRACK_ORDER_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Erreur lors de la lecture de l\'ordre des tracks', err);
      return [];
    }
  }

  /**
   * Sauvegarde les tracks dans localStorage avec gestion d'erreurs
   * @param tracks - Array de tracks
   */
  private saveToStorage(tracks: Track[]): void {
    try {
      const data = JSON.stringify(tracks);
      
      // Vérifier la taille avant de sauvegarder (localStorage limité à ~5MB)
      const sizeInBytes = new Blob([data]).size;
      const maxSize = 4.5 * 1024 * 1024; // 4.5 MB pour laisser de la marge
      
      if (sizeInBytes > maxSize) {
        throw new Error('Données trop volumineuses pour localStorage');
      }
      
      localStorage.setItem(this.STORAGE_KEY, data);
    } catch (err) {
      if (err instanceof Error && err.name === 'QuotaExceededError') {
        throw new Error('Espace de stockage insuffisant');
      }
      throw err;
    }
  }

  /**
   * Efface toutes les données du stockage
   */
  clearAll(): ValidationResult {
    this.setLoadingState('loading');
    this.lastOperation.set('clearAll');
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.TRACK_ORDER_KEY);
      this.setLoadingState('success');
      return { isValid: true };
    } catch (err) {
      const errorMsg = 'Erreur lors de la suppression des données';
      console.error(errorMsg, err);
      this.setLoadingState('error', errorMsg);
      return { isValid: false, error: errorMsg };
    }
  }

  /**
   * Vérifie si le localStorage est disponible
   */
  isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Initialise avec des tracks de test (données par défaut)
   */
  private initializeDefaultTracks(): void {
    const defaultTracks: Track[] = [
      {
        id: 'track-1',
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        description: 'Un chef-d\'œuvre classique du rock',
        category: 'rock',
        duration: 354,
        addedDate: new Date('2025-01-01'),
        filePath: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        plays: 0,
        liked: false,
        order: 0,
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
        plays: 0,
        liked: false,
        order: 1,
      },
    ];
    this.saveToStorage(defaultTracks);
  }
}
