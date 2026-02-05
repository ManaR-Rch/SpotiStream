import { Track } from '../../models/track.model';

/**
 * 🔄 SongTrackAdapter - Convertir entre Song (backend) et Track (frontend)
 * 
 * Problème:
 * - Le backend retourne des "Song" (avec certains champs)
 * - Le frontend utilise des "Track" (avec peut-être d'autres champs)
 * 
 * Solution:
 * - Adapter les objets Song en Track
 * - Mapper les champs d'un côté à l'autre
 * 
 * Cas réel:
 * Backend (Song):         Frontend (Track):
 * - id (Long)        →    - id (string)
 * - title            →    - title
 * - artist           →    - artist
 * - album            →    - album (nouveau)
 * - genre            →    - ? (pas utilisé)
 * - category         →    - category
 * - duration         →    - duration
 * - audioUrl         →    - filePath
 * - imageUrl         →    - ? (nouveau)
 * - createdAt        →    - addedDate
 */
export class SongTrackAdapter {

  /**
   * Convertir un Song (API) en Track (Frontend)
   * 
   * @param song L'objet Song du backend
   * @returns Track L'objet Track pour le frontend
   */
  static songToTrack(song: any): Track {
    return {
      id: String(song.id), // Convertir Long en string
      title: song.title,
      artist: song.artist,
      description: song.album, // Utiliser album comme description
      category: (song.category as any) || 'other',
      duration: song.duration || 0,
      addedDate: new Date(song.createdAt), // Convertir timestamp
      filePath: song.audioUrl,
      fileSize: undefined,
      plays: 0,
      liked: false
    };
  }

  /**
   * Convertir un Track (Frontend) en Song (API)
   * 
   * @param track L'objet Track du frontend
   * @returns Objet Song pour l'API
   */
  static trackToSong(track: Track): any {
    return {
      id: isNaN(Number(track.id)) ? undefined : Number(track.id), // Convertir string en Long
      title: track.title,
      artist: track.artist,
      album: track.description,
      category: track.category,
      duration: track.duration,
      audioUrl: track.filePath,
      imageUrl: undefined,
      createdAt: track.addedDate.toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Convertir une liste de Song en Track[]
   * 
   * @param songs Liste de Song
   * @returns Liste de Track
   */
  static songsToTracks(songs: any[]): Track[] {
    return songs.map(song => this.songToTrack(song));
  }

  /**
   * Convertir une liste de Track en Song[]
   * 
   * @param tracks Liste de Track
   * @returns Liste de Song
   */
  static tracksToSongs(tracks: Track[]): any[] {
    return tracks.map(track => this.trackToSong(track));
  }
}
