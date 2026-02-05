import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Track } from '../../models/track.model';

/**
 * 🎵 ApiService - Service pour communiquer avec l'API REST Spring Boot
 * 
 * @Injectable = Peut être injecté dans d'autres services/composants
 * HttpClient = Service Angular pour faire les requêtes HTTP (GET, POST, PUT, DELETE)
 * 
 * Ce service encapsule TOUTES les requêtes HTTP vers le backend.
 * Les composants ne connaissent pas l'existence de l'API directement,
 * ils demandent juste au service: "Donne-moi les chansons"
 * 
 * Avantages:
 * ✅ Un seul endroit pour configurer l'API (URL, headers, etc.)
 * ✅ Facile de changer le backend (même URL, même interface)
 * ✅ Gestion des erreurs centralisée
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // URL de base de l'API Spring Boot
  // Utilise le proxy nginx (/api) qui redirige vers le backend
  // Cela fonctionne en local ET en Docker
  private readonly apiBaseUrl = '/api';

  constructor(private httpClient: HttpClient) {}

  /**
   * GET /api/songs
   * Récupérer TOUTES les chansons
   * 
   * @returns Observable<Track[]> - Stream des chansons
   */
  getAllTracks(): Observable<Track[]> {
    return this.httpClient.get<Track[]>(`${this.apiBaseUrl}/songs`);
  }

  /**
   * GET /api/songs/{id}
   * Récupérer UNE chanson par ID
   * 
   * @param id L'ID de la chanson
   * @returns Observable<Track> - Stream de la chanson
   */
  getTrackById(id: string | number): Observable<Track> {
    return this.httpClient.get<Track>(`${this.apiBaseUrl}/songs/${id}`);
  }

  /**
   * POST /api/songs
   * CRÉER une nouvelle chanson
   * 
   * @param track Les données de la chanson
   * @returns Observable<Track> - Stream de la chanson créée (avec l'ID généré)
   */
  createTrack(track: Track): Observable<Track> {
    // Nettoyer l'objet: enlever l'ID si c'est une création (pas de mise à jour)
    const { id, ...trackData } = track;
    return this.httpClient.post<Track>(`${this.apiBaseUrl}/songs`, trackData);
  }

  /**
   * PUT /api/songs/{id}
   * METTRE À JOUR une chanson
   * 
   * @param id L'ID de la chanson
   * @param track Les nouvelles données
   * @returns Observable<Track> - Stream de la chanson mise à jour
   */
  updateTrack(id: string | number, track: Track): Observable<Track> {
    return this.httpClient.put<Track>(`${this.apiBaseUrl}/songs/${id}`, track);
  }

  /**
   * DELETE /api/songs/{id}
   * SUPPRIMER une chanson
   * 
   * @param id L'ID de la chanson
   * @returns Observable<void> - Stream de suppression
   */
  deleteTrack(id: string | number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiBaseUrl}/songs/${id}`);
  }

  /**
   * GET /api/songs/search/by-title?q=keyword
   * RECHERCHER des chansons par titre
   * 
   * @param keyword Le mot-clé à chercher
   * @returns Observable<Track[]> - Stream des chansons trouvées
   */
  searchTracksByTitle(keyword: string): Observable<Track[]> {
    return this.httpClient.get<Track[]>(
      `${this.apiBaseUrl}/songs/search/by-title`,
      { params: { q: keyword } }
    );
  }

  /**
   * GET /api/songs/search/by-artist?q=keyword
   * RECHERCHER des chansons par artiste
   * 
   * @param keyword Le mot-clé à chercher
   * @returns Observable<Track[]> - Stream des chansons trouvées
   */
  searchTracksByArtist(keyword: string): Observable<Track[]> {
    return this.httpClient.get<Track[]>(
      `${this.apiBaseUrl}/songs/search/by-artist`,
      { params: { q: keyword } }
    );
  }

  /**
   * GET /api/songs/category/{category}
   * Récupérer toutes les chansons d'une catégorie
   * 
   * @param category La catégorie (pop, rock, jazz, etc.)
   * @returns Observable<Track[]> - Stream des chansons
   */
  getTracksByCategory(category: string): Observable<Track[]> {
    return this.httpClient.get<Track[]>(
      `${this.apiBaseUrl}/songs/category/${category}`
    );
  }
}
