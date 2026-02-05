import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, catchError, map, tap } from 'rxjs';
import { LyricsResult, LoadingState } from '../models/track.model';

/**
 * LyricsService - Service pour récupérer les paroles de chansons
 * 
 * Utilise l'API lyrics.ovh (gratuite et sans clé API) comme source principale
 * Documentation: https://lyricsovh.docs.apiary.io/
 * 
 * États réactifs avec Signals:
 * - loadingState: 'idle' | 'loading' | 'success' | 'error'
 * - currentLyrics: Paroles actuelles
 * - error: Message d'erreur
 */
@Injectable({
  providedIn: 'root'
})
export class LyricsService {
  // URL de l'API lyrics.ovh
  private readonly API_URL = 'https://api.lyrics.ovh/v1';

  // États réactifs avec Signals (Angular 17+)
  public loadingState = signal<LoadingState>('idle');
  public currentLyrics = signal<LyricsResult | null>(null);
  public error = signal<string | null>(null);

  // Cache des paroles pour éviter les requêtes répétées
  private lyricsCache = new Map<string, LyricsResult>();

  constructor(private http: HttpClient) {}

  /**
   * Récupère les paroles d'une chanson par artiste et titre
   * @param artist - Nom de l'artiste
   * @param title - Titre de la chanson
   * @returns Observable avec les paroles ou null si non trouvées
   */
  getLyrics(artist: string, title: string): Observable<LyricsResult | null> {
    // Générer une clé unique pour le cache
    const cacheKey = this.generateCacheKey(artist, title);

    // Vérifier le cache
    if (this.lyricsCache.has(cacheKey)) {
      const cached = this.lyricsCache.get(cacheKey)!;
      this.currentLyrics.set(cached);
      this.loadingState.set('success');
      return of(cached);
    }

    // Nettoyer les paramètres
    const cleanArtist = this.cleanSearchParam(artist);
    const cleanTitle = this.cleanSearchParam(title);

    if (!cleanArtist || !cleanTitle) {
      this.error.set('Artiste et titre requis');
      this.loadingState.set('error');
      return of(null);
    }

    this.loadingState.set('loading');
    this.error.set(null);

    const url = `${this.API_URL}/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`;

    return this.http.get<{ lyrics: string }>(url).pipe(
      map(response => {
        if (response && response.lyrics) {
          const result: LyricsResult = {
            lyrics: this.formatLyrics(response.lyrics),
            artist: artist,
            title: title,
            source: 'lyrics.ovh'
          };
          
          // Mettre en cache
          this.lyricsCache.set(cacheKey, result);
          
          return result;
        }
        return null;
      }),
      tap(result => {
        if (result) {
          this.currentLyrics.set(result);
          this.loadingState.set('success');
        } else {
          this.error.set('Paroles non trouvées');
          this.loadingState.set('error');
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching lyrics:', error);
        
        let errorMessage = 'Paroles non trouvées';
        if (error.status === 404) {
          errorMessage = 'Paroles non disponibles pour cette chanson';
        } else if (error.status === 0) {
          errorMessage = 'Erreur de connexion - vérifiez votre réseau';
        }
        
        this.error.set(errorMessage);
        this.loadingState.set('error');
        return of(null);
      })
    );
  }

  /**
   * Recherche les paroles avec des termes de recherche flexibles
   * Essaie plusieurs variations si la première recherche échoue
   * @param artist - Nom de l'artiste
   * @param title - Titre de la chanson
   */
  searchLyrics(artist: string, title: string): Observable<LyricsResult | null> {
    // Première tentative avec les termes originaux
    return this.getLyrics(artist, title);
  }

  /**
   * Efface les paroles actuelles
   */
  clearLyrics(): void {
    this.currentLyrics.set(null);
    this.error.set(null);
    this.loadingState.set('idle');
  }

  /**
   * Vide le cache des paroles
   */
  clearCache(): void {
    this.lyricsCache.clear();
  }

  /**
   * Génère une clé de cache unique
   */
  private generateCacheKey(artist: string, title: string): string {
    return `${artist.toLowerCase().trim()}:${title.toLowerCase().trim()}`;
  }

  /**
   * Nettoie un paramètre de recherche
   */
  private cleanSearchParam(param: string): string {
    if (!param) return '';
    
    return param
      .trim()
      .replace(/\s+/g, ' ')  // Normaliser les espaces
      .replace(/[^\w\s'-]/g, '');  // Garder lettres, chiffres, espaces, apostrophes et tirets
  }

  /**
   * Formate les paroles pour un meilleur affichage
   */
  private formatLyrics(lyrics: string): string {
    if (!lyrics) return '';
    
    return lyrics
      .trim()
      .replace(/\r\n/g, '\n')  // Normaliser les sauts de ligne
      .replace(/\n{3,}/g, '\n\n');  // Limiter les lignes vides consécutives
  }

  /**
   * Vérifie si des paroles sont disponibles pour un track
   */
  hasLyrics(): boolean {
    return this.currentLyrics() !== null;
  }

  /**
   * Retourne l'état de chargement
   */
  isLoading(): boolean {
    return this.loadingState() === 'loading';
  }
}
