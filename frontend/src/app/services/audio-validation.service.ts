import { Injectable } from '@angular/core';

/**
 * AudioValidationService - Service pour valider les fichiers audio
 * 
 * Validation:
 * - Taille max: 10 MB
 * - Formats: MP3, WAV, OGG
 * 
 * Niveau: DÉBUTANT - Logique simple et directe
 */
@Injectable({
  providedIn: 'root',
})
export class AudioValidationService {
  // Configuration de validation
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB en bytes
  private readonly ALLOWED_FORMATS = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
  private readonly ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.ogg'];

  /**
   * Valider un fichier audio
   * @param file - Le fichier à valider
   * @returns Object avec { isValid: boolean, error?: string }
   */
  validateAudioFile(file: File): { isValid: boolean; error?: string } {
    // Vérifier si le fichier existe
    if (!file) {
      return { isValid: false, error: 'Aucun fichier sélectionné' };
    }

    // Vérifier le format MIME
    if (!this.isValidFormat(file.type)) {
      return {
        isValid: false,
        error: `Format non autorisé. Formats acceptés: ${this.ALLOWED_EXTENSIONS.join(', ')}`
      };
    }

    // Vérifier la taille
    if (!this.isValidSize(file.size)) {
      return {
        isValid: false,
        error: `Le fichier est trop volumineux. Taille max: 10 MB`
      };
    }

    // Tout est bon
    return { isValid: true };
  }

  /**
   * Vérifier si le format est autorisé
   * @param mimeType - Type MIME du fichier
   * @returns true si le format est autorisé
   */
  private isValidFormat(mimeType: string): boolean {
    return this.ALLOWED_FORMATS.includes(mimeType);
  }

  /**
   * Vérifier si la taille est valide
   * @param fileSize - Taille du fichier en bytes
   * @returns true si la taille est valide
   */
  private isValidSize(fileSize: number): boolean {
    return fileSize <= this.MAX_FILE_SIZE;
  }

  /**
   * Convertir les bytes en MB (pour l'affichage)
   * @param bytes - Taille en bytes
   * @returns Taille en MB
   */
  formatFileSize(bytes: number): string {
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    return `${mb} MB`;
  }
}
