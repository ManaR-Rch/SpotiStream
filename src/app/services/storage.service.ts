import { Injectable } from '@angular/core';
import { Track } from '../models/track.model';

/**
 * StorageService - Service pour gérer localStorage
 * 
 * Responsabilités:
 * - Sauvegarder les tracks dans localStorage
 * - Récupérer les tracks depuis localStorage
 * - Mettre à jour et supprimer les tracks
 * 
 * IMPORTANT: Utilise uniquement localStorage (pas d'IndexedDB)
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  // Clé pour accéder aux données dans localStorage
  private readonly STORAGE_KEY = 'music_tracks';

  constructor() {
    // Initialiser le localStorage s'il est vide
    if (!this.getTracks()) {
      this.initializeDefaultTracks();
    }
  }

  /**
   * Récupère tous les tracks du localStorage
   * @returns Array de tracks ou null si vide
   */
  getTracks(): Track[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  }

  /**
   * Sauvegarde un nouveau track
   * @param track - Track à ajouter
   */
  addTrack(track: Track): void {
    const tracks = this.getTracks();
    tracks.push(track);
    this.saveToStorage(tracks);
  }

  /**
   * Met à jour un track existant
   * @param trackId - ID du track
   * @param updatedTrack - Données mises à jour
   */
  updateTrack(trackId: string, updatedTrack: Partial<Track>): void {
    const tracks = this.getTracks();
    const index = tracks.findIndex(t => t.id === trackId);
    if (index !== -1) {
      tracks[index] = { ...tracks[index], ...updatedTrack };
      this.saveToStorage(tracks);
    }
  }

  /**
   * Supprime un track
   * @param trackId - ID du track à supprimer
   */
  deleteTrack(trackId: string): void {
    const tracks = this.getTracks();
    const filtered = tracks.filter(t => t.id !== trackId);
    this.saveToStorage(filtered);
  }

  /**
   * Sauvegarde les tracks dans localStorage
   * @param tracks - Array de tracks
   */
  private saveToStorage(tracks: Track[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tracks));
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
      },
    ];
    this.saveToStorage(defaultTracks);
  }
}
