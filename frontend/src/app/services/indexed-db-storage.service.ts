import { Injectable, signal } from '@angular/core';
import { TRACK_VALIDATION, ValidationResult } from '../models/track.model';

/**
 * IndexedDB Storage Service - Stockage des fichiers audio et images volumineux
 * 
 * Utilise IndexedDB pour stocker:
 * - Les fichiers audio (jusqu'à 10MB)
 * - Les images de couverture (jusqu'à 5MB)
 * - Les métadonnées associées
 * 
 * Avantages:
 * ✅ Stockage de fichiers volumineux (contrairement à localStorage limité à 5MB)
 * ✅ Accès asynchrone non-bloquant
 * ✅ Persistance entre les sessions
 * ✅ Gestion des erreurs robuste
 */
@Injectable({
  providedIn: 'root',
})
export class IndexedDbStorageService {
  // Configuration de la base de données
  private readonly DB_NAME = 'musicstream_db';
  private readonly DB_VERSION = 2; // Version augmentée pour le nouveau store d'images
  private readonly AUDIO_STORE = 'audio_files';
  private readonly IMAGE_STORE = 'cover_images';
  private readonly METADATA_STORE = 'metadata';

  // Constantes de validation audio
  readonly MAX_FILE_SIZE = TRACK_VALIDATION.MAX_AUDIO_FILE_SIZE;
  readonly ALLOWED_FORMATS = TRACK_VALIDATION.ALLOWED_AUDIO_FORMATS;
  readonly ALLOWED_EXTENSIONS = TRACK_VALIDATION.ALLOWED_AUDIO_EXTENSIONS;

  // Constantes de validation image
  readonly MAX_IMAGE_SIZE = TRACK_VALIDATION.MAX_IMAGE_FILE_SIZE;
  readonly ALLOWED_IMAGE_FORMATS = TRACK_VALIDATION.ALLOWED_IMAGE_FORMATS;
  readonly ALLOWED_IMAGE_EXTENSIONS = TRACK_VALIDATION.ALLOWED_IMAGE_EXTENSIONS;

  // État réactif avec Signals
  isReady = signal<boolean>(false);
  error = signal<string | null>(null);
  lastOperation = signal<string>('');

  // Instance de la base de données
  private db: IDBDatabase | null = null;

  constructor() {
    this.initializeDatabase();
  }

  /**
   * Initialise la base de données IndexedDB
   */
  private async initializeDatabase(): Promise<void> {
    try {
      this.db = await this.openDatabase();
      this.isReady.set(true);
      this.error.set(null);
      console.log('IndexedDB initialized successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize IndexedDB';
      this.error.set(errorMessage);
      console.error('IndexedDB initialization failed:', err);
    }
  }

  /**
   * Ouvre ou crée la base de données
   */
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject(new Error(`Failed to open database: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Créer le store pour les fichiers audio
        if (!db.objectStoreNames.contains(this.AUDIO_STORE)) {
          const audioStore = db.createObjectStore(this.AUDIO_STORE, { keyPath: 'id' });
          audioStore.createIndex('trackId', 'trackId', { unique: true });
        }

        // Créer le store pour les images de couverture
        if (!db.objectStoreNames.contains(this.IMAGE_STORE)) {
          const imageStore = db.createObjectStore(this.IMAGE_STORE, { keyPath: 'id' });
          imageStore.createIndex('trackId', 'trackId', { unique: true });
        }

        // Créer le store pour les métadonnées
        if (!db.objectStoreNames.contains(this.METADATA_STORE)) {
          const metadataStore = db.createObjectStore(this.METADATA_STORE, { keyPath: 'id' });
          metadataStore.createIndex('title', 'title', { unique: false });
          metadataStore.createIndex('category', 'category', { unique: false });
        }
      };
    });
  }

  /**
   * Vérifie que la base de données est prête
   */
  private ensureReady(): void {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
  }

  /**
   * Valide un fichier audio
   * @param file - Le fichier à valider
   * @returns Object avec { isValid, error }
   */
  validateAudioFile(file: File): ValidationResult {
    // Vérifier si le fichier existe
    if (!file) {
      return { isValid: false, error: 'Aucun fichier sélectionné' };
    }

    // Vérifier le format MIME
    const isValidMime = this.ALLOWED_FORMATS.includes(file.type);
    
    // Vérifier l'extension (fallback si MIME non détecté)
    const fileName = file.name.toLowerCase();
    const isValidExtension = this.ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));

    if (!isValidMime && !isValidExtension) {
      return {
        isValid: false,
        error: `Format non autorisé. Formats acceptés: ${this.ALLOWED_EXTENSIONS.join(', ')}`
      };
    }

    // Vérifier la taille
    if (file.size > this.MAX_FILE_SIZE) {
      const maxSizeMB = (this.MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return {
        isValid: false,
        error: `Fichier trop volumineux (${fileSizeMB} MB). Taille max: ${maxSizeMB} MB`
      };
    }

    return { isValid: true };
  }

  /**
   * Valide un fichier image de couverture
   * @param file - Le fichier image à valider
   * @returns ValidationResult avec { isValid, error }
   */
  validateImageFile(file: File): ValidationResult {
    // Vérifier si le fichier existe
    if (!file) {
      return { isValid: false, error: 'Aucune image sélectionnée' };
    }

    // Vérifier le format MIME
    const isValidMime = this.ALLOWED_IMAGE_FORMATS.includes(file.type);
    
    // Vérifier l'extension (fallback si MIME non détecté)
    const fileName = file.name.toLowerCase();
    const isValidExtension = this.ALLOWED_IMAGE_EXTENSIONS.some(ext => fileName.endsWith(ext));

    if (!isValidMime && !isValidExtension) {
      return {
        isValid: false,
        error: `Format d'image non autorisé. Formats acceptés: ${this.ALLOWED_IMAGE_EXTENSIONS.join(', ')}`
      };
    }

    // Vérifier la taille
    if (file.size > this.MAX_IMAGE_SIZE) {
      const maxSizeMB = (this.MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(0);
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return {
        isValid: false,
        error: `Image trop volumineuse (${fileSizeMB} MB). Taille max: ${maxSizeMB} MB`
      };
    }

    return { isValid: true };
  }

  /**
   * Stocke un fichier audio dans IndexedDB
   * @param trackId - ID unique du track
   * @param file - Le fichier audio à stocker
   * @returns Promise avec l'URL blob du fichier
   */
  async storeAudioFile(trackId: string, file: File): Promise<string> {
    this.ensureReady();
    this.lastOperation.set('storeAudioFile');

    // Valider le fichier
    const validation = this.validateAudioFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(this.AUDIO_STORE);

      const audioRecord = {
        id: `audio-${trackId}`,
        trackId: trackId,
        blob: file,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        createdAt: new Date().toISOString()
      };

      const request = store.put(audioRecord);

      request.onsuccess = () => {
        // Créer une URL blob pour la lecture
        const blobUrl = URL.createObjectURL(file);
        console.log(`Audio file stored for track ${trackId}`);
        resolve(blobUrl);
      };

      request.onerror = () => {
        reject(new Error(`Failed to store audio file: ${request.error?.message}`));
      };
    });
  }

  /**
   * Stocke une image de couverture dans IndexedDB
   * @param trackId - ID unique du track
   * @param file - Le fichier image à stocker
   * @returns Promise avec l'URL blob de l'image
   */
  async storeCoverImage(trackId: string, file: File): Promise<string> {
    this.ensureReady();
    this.lastOperation.set('storeCoverImage');

    // Valider le fichier image
    const validation = this.validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.IMAGE_STORE], 'readwrite');
      const store = transaction.objectStore(this.IMAGE_STORE);

      const imageRecord = {
        id: `image-${trackId}`,
        trackId: trackId,
        blob: file,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        createdAt: new Date().toISOString()
      };

      const request = store.put(imageRecord);

      request.onsuccess = () => {
        // Créer une URL blob pour l'affichage
        const blobUrl = URL.createObjectURL(file);
        console.log(`Cover image stored for track ${trackId}`);
        resolve(blobUrl);
      };

      request.onerror = () => {
        reject(new Error(`Failed to store cover image: ${request.error?.message}`));
      };
    });
  }

  /**
   * Récupère un fichier audio depuis IndexedDB
   * @param trackId - ID du track
   * @returns Promise avec l'URL blob ou null si non trouvé
   */
  async getAudioFile(trackId: string): Promise<string | null> {
    this.ensureReady();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.AUDIO_STORE], 'readonly');
      const store = transaction.objectStore(this.AUDIO_STORE);
      const index = store.index('trackId');
      const request = index.get(trackId);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.blob) {
          const blobUrl = URL.createObjectURL(result.blob);
          resolve(blobUrl);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to get audio file: ${request.error?.message}`));
      };
    });
  }

  /**
   * Récupère une image de couverture depuis IndexedDB
   * @param trackId - ID du track
   * @returns Promise avec l'URL blob ou null si non trouvée
   */
  async getCoverImage(trackId: string): Promise<string | null> {
    this.ensureReady();
    this.lastOperation.set('getCoverImage');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.IMAGE_STORE], 'readonly');
      const store = transaction.objectStore(this.IMAGE_STORE);
      const index = store.index('trackId');
      const request = index.get(trackId);

      request.onsuccess = () => {
        const result = request.result;
        if (result && result.blob) {
          const blobUrl = URL.createObjectURL(result.blob);
          resolve(blobUrl);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(new Error(`Failed to get cover image: ${request.error?.message}`));
      };
    });
  }

  /**
   * Supprime un fichier audio d'IndexedDB
   * @param trackId - ID du track
   */
  async deleteAudioFile(trackId: string): Promise<void> {
    this.ensureReady();
    this.lastOperation.set('deleteAudioFile');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(this.AUDIO_STORE);
      const request = store.delete(`audio-${trackId}`);

      request.onsuccess = () => {
        console.log(`Audio file deleted for track ${trackId}`);
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to delete audio file: ${request.error?.message}`));
      };
    });
  }

  /**
   * Supprime une image de couverture d'IndexedDB
   * @param trackId - ID du track
   */
  async deleteCoverImage(trackId: string): Promise<void> {
    this.ensureReady();
    this.lastOperation.set('deleteCoverImage');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.IMAGE_STORE], 'readwrite');
      const store = transaction.objectStore(this.IMAGE_STORE);
      const request = store.delete(`image-${trackId}`);

      request.onsuccess = () => {
        console.log(`Cover image deleted for track ${trackId}`);
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to delete cover image: ${request.error?.message}`));
      };
    });
  }

  /**
   * Supprime tous les fichiers associés à un track (audio + image)
   * @param trackId - ID du track
   */
  async deleteAllTrackFiles(trackId: string): Promise<void> {
    await Promise.all([
      this.deleteAudioFile(trackId).catch(() => {}),
      this.deleteCoverImage(trackId).catch(() => {})
    ]);
  }

  /**
   * Convertit les bytes en format lisible
   * @param bytes - Taille en bytes
   * @returns Taille formatée (ex: "5.23 MB")
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Vérifie si IndexedDB est supporté
   */
  isSupported(): boolean {
    return typeof indexedDB !== 'undefined';
  }

  /**
   * Vide tout le stockage audio
   */
  async clearAllAudioFiles(): Promise<void> {
    this.ensureReady();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(this.AUDIO_STORE);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('All audio files cleared');
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to clear audio files: ${request.error?.message}`));
      };
    });
  }
}
