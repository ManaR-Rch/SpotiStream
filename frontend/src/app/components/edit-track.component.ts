import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrackService } from '../services/track.service';
import { IndexedDbStorageService } from '../services/indexed-db-storage.service';
import { TRACK_VALIDATION, Track } from '../models/track.model';

/**
 * EditTrackComponent - Formulaire pour modifier des tracks existants
 * 
 * Fonctionnalités:
 * - Chargement des données existantes du track
 * - Validation des champs (titre max 50, description max 200)
 * - Validation des fichiers audio (MP3, WAV, OGG, max 10MB)
 * - Validation des images de couverture (PNG, JPEG, max 5MB)
 * - États de chargement et messages d'erreur
 */
@Component({
  selector: 'app-edit-track',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-track.component.html',
  styleUrls: ['./edit-track.component.css']
})
export class EditTrackComponent implements OnInit {
  trackForm!: FormGroup;
  submitted = false;
  isLoading = false;
  isLoadingTrack = true;
  successMessage = '';
  errorMessage = '';
  categories = TRACK_VALIDATION.CATEGORIES;

  // Track à éditer
  trackId: string | null = null;
  currentTrack: Track | null = null;

  // Fichier audio sélectionné (nouveau)
  selectedFile: File | null = null;
  fileError: string = '';
  fileInfo: string = '';
  currentAudioInfo: string = '';

  // Image de couverture (nouvelle ou existante)
  selectedCoverImage: File | null = null;
  coverImageError: string = '';
  coverImageInfo: string = '';
  coverImagePreview: string | null = null;
  hasExistingCover: boolean = false;

  // Validation constraints
  readonly MAX_FILE_SIZE_MB = TRACK_VALIDATION.MAX_AUDIO_FILE_SIZE / (1024 * 1024);
  readonly ALLOWED_FORMATS = TRACK_VALIDATION.ALLOWED_AUDIO_EXTENSIONS.join(', ');
  readonly MAX_IMAGE_SIZE_MB = TRACK_VALIDATION.MAX_IMAGE_FILE_SIZE / (1024 * 1024);
  readonly ALLOWED_IMAGE_FORMATS = TRACK_VALIDATION.ALLOWED_IMAGE_EXTENSIONS.join(', ');

  constructor(
    private formBuilder: FormBuilder,
    private trackService: TrackService,
    private indexedDbStorage: IndexedDbStorageService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.loadTrack();
  }

  /**
   * Créer le formulaire avec validations
   */
  createForm(): void {
    this.trackForm = this.formBuilder.group({
      title: [
        '',
        [
          Validators.required,
          Validators.maxLength(TRACK_VALIDATION.TITLE_MAX_LENGTH)
        ]
      ],
      artist: [
        '',
        [Validators.required]
      ],
      description: [
        '',
        [Validators.maxLength(TRACK_VALIDATION.DESCRIPTION_MAX_LENGTH)]
      ],
      category: [
        '',
        [Validators.required]
      ]
    });
  }

  /**
   * Charger les données du track à éditer
   */
  private loadTrack(): void {
    this.trackId = this.route.snapshot.paramMap.get('id');
    
    if (!this.trackId) {
      this.errorMessage = 'ID de track manquant';
      this.isLoadingTrack = false;
      return;
    }

    this.trackService.getTrackById(this.trackId).subscribe({
      next: (track) => {
        if (track) {
          this.currentTrack = track;
          this.populateForm(track);
          
          // Info sur le fichier audio actuel
          if (track.fileSize) {
            this.currentAudioInfo = `Fichier actuel: ${this.indexedDbStorage.formatFileSize(track.fileSize)}`;
          }
          
          // Image de couverture existante
          if (track.coverImage) {
            this.coverImagePreview = track.coverImage;
            this.hasExistingCover = true;
          }
        } else {
          this.errorMessage = 'Track non trouvé';
        }
        this.isLoadingTrack = false;
      },
      error: (err) => {
        console.error('Error loading track:', err);
        this.errorMessage = 'Erreur lors du chargement du track';
        this.isLoadingTrack = false;
      }
    });
  }

  /**
   * Remplir le formulaire avec les données du track
   */
  private populateForm(track: Track): void {
    this.trackForm.patchValue({
      title: track.title,
      artist: track.artist,
      description: track.description || '',
      category: track.category
    });
  }

  // Getters pour les champs du formulaire
  get title() { return this.trackForm.get('title'); }
  get artist() { return this.trackForm.get('artist'); }
  get description() { return this.trackForm.get('description'); }
  get category() { return this.trackForm.get('category'); }

  /**
   * Gérer la sélection de fichier audio
   */
  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    this.selectedFile = null;
    this.fileError = '';
    this.fileInfo = '';

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const validation = this.indexedDbStorage.validateAudioFile(file);

    if (!validation.isValid) {
      this.fileError = validation.error || 'Fichier invalide';
      target.value = '';
      return;
    }

    this.selectedFile = file;
    this.fileInfo = `Nouveau fichier: ${file.name} (${this.indexedDbStorage.formatFileSize(file.size)})`;
  }

  /**
   * Gérer la sélection de l'image de couverture
   */
  onCoverImageSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    this.selectedCoverImage = null;
    this.coverImageError = '';
    this.coverImageInfo = '';

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    const validation = this.indexedDbStorage.validateImageFile(file);

    if (!validation.isValid) {
      this.coverImageError = validation.error || 'Image invalide';
      target.value = '';
      return;
    }

    this.selectedCoverImage = file;
    this.coverImageInfo = `${file.name} (${this.indexedDbStorage.formatFileSize(file.size)})`;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      this.coverImagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    this.hasExistingCover = false;
  }

  /**
   * Supprimer l'image de couverture
   */
  removeCoverImage(): void {
    this.selectedCoverImage = null;
    this.coverImageError = '';
    this.coverImageInfo = '';
    this.coverImagePreview = null;
    this.hasExistingCover = false;
  }

  /**
   * Soumettre le formulaire
   */
  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.trackForm.invalid || !this.currentTrack) {
      return;
    }

    this.isLoading = true;

    try {
      const updatedTrack: Partial<Track> = {
        title: this.title?.value,
        artist: this.artist?.value,
        description: this.description?.value || '',
        category: this.category?.value
      };

      // Si un nouveau fichier audio est sélectionné
      if (this.selectedFile && this.trackId) {
        const blobUrl = await this.indexedDbStorage.storeAudioFile(this.trackId, this.selectedFile);
        updatedTrack.filePath = blobUrl;
        updatedTrack.fileSize = this.selectedFile.size;
      }

      // Si une nouvelle image de couverture est sélectionnée
      if (this.selectedCoverImage && this.trackId) {
        const coverBlobUrl = await this.indexedDbStorage.storeCoverImage(this.trackId, this.selectedCoverImage);
        updatedTrack.coverImage = coverBlobUrl;
        updatedTrack.coverImageSize = this.selectedCoverImage.size;
      } else if (!this.coverImagePreview && this.hasExistingCover) {
        // L'image a été supprimée
        updatedTrack.coverImage = undefined;
        updatedTrack.coverImageSize = undefined;
        if (this.trackId) {
          await this.indexedDbStorage.deleteCoverImage(this.trackId);
        }
      }

      // Mettre à jour le track et attendre la fin
      await this.trackService.updateTrack(this.trackId!, updatedTrack);

      this.successMessage = '✅ Track mis à jour avec succès!';
      
      setTimeout(() => {
        this.router.navigate(['/library']);
      }, 1500);

    } catch (err: any) {
      this.errorMessage = err.message || 'Erreur lors de la mise à jour du track';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Retour à la bibliothèque
   */
  goBack(): void {
    this.router.navigate(['/library']);
  }
}
