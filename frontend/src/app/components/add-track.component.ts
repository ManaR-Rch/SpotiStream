import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TrackService } from '../services/track.service';
import { IndexedDbStorageService } from '../services/indexed-db-storage.service';
import { TRACK_VALIDATION, Track } from '../models/track.model';

/**
 * AddTrackComponent - Formulaire pour ajouter des tracks
 * 
 * Fonctionnalités:
 * - Validation des champs (titre max 50, description max 200)
 * - Validation des fichiers audio (MP3, WAV, OGG, max 10MB)
 * - Validation des images de couverture (PNG, JPEG, max 5MB)
 * - Stockage IndexedDB pour les fichiers volumineux
 * - États de chargement et messages d'erreur
 */
@Component({
  selector: 'app-add-track',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-track.component.html',
  styleUrls: ['./add-track.component.css']
})
export class AddTrackComponent implements OnInit {
  trackForm!: FormGroup;
  submitted = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  categories = TRACK_VALIDATION.CATEGORIES;

  // Fichier audio sélectionné
  selectedFile: File | null = null;
  fileError: string = '';
  fileInfo: string = '';

  // Image de couverture sélectionnée (optionnelle)
  selectedCoverImage: File | null = null;
  coverImageError: string = '';
  coverImageInfo: string = '';
  coverImagePreview: string | null = null;

  // Validation constraints (pour l'affichage)
  readonly MAX_FILE_SIZE_MB = TRACK_VALIDATION.MAX_AUDIO_FILE_SIZE / (1024 * 1024);
  readonly ALLOWED_FORMATS = TRACK_VALIDATION.ALLOWED_AUDIO_EXTENSIONS.join(', ');
  readonly MAX_IMAGE_SIZE_MB = TRACK_VALIDATION.MAX_IMAGE_FILE_SIZE / (1024 * 1024);
  readonly ALLOWED_IMAGE_FORMATS = TRACK_VALIDATION.ALLOWED_IMAGE_EXTENSIONS.join(', ');

  constructor(
    private formBuilder: FormBuilder,
    private trackService: TrackService,
    private indexedDbStorage: IndexedDbStorageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.createForm();
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

    // Reset previous state
    this.selectedFile = null;
    this.fileError = '';
    this.fileInfo = '';

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    // Valider le fichier avec IndexedDbStorageService
    const validation = this.indexedDbStorage.validateAudioFile(file);

    if (!validation.isValid) {
      this.fileError = validation.error || 'Fichier invalide';
      target.value = ''; // Reset input
      return;
    }

    // Fichier valide
    this.selectedFile = file;
    this.fileInfo = `${file.name} (${this.indexedDbStorage.formatFileSize(file.size)})`;
  }

  /**
   * Gérer la sélection de l'image de couverture
   */
  onCoverImageSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    // Reset previous state
    this.selectedCoverImage = null;
    this.coverImageError = '';
    this.coverImageInfo = '';
    this.coverImagePreview = null;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    // Valider le fichier image avec IndexedDbStorageService
    const validation = this.indexedDbStorage.validateImageFile(file);

    if (!validation.isValid) {
      this.coverImageError = validation.error || 'Image invalide';
      target.value = ''; // Reset input
      return;
    }

    // Image valide - créer la preview
    this.selectedCoverImage = file;
    this.coverImageInfo = `${file.name} (${this.indexedDbStorage.formatFileSize(file.size)})`;
    
    // Créer l'aperçu de l'image
    const reader = new FileReader();
    reader.onload = (e) => {
      this.coverImagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Supprimer l'image de couverture sélectionnée
   */
  removeCoverImage(): void {
    this.selectedCoverImage = null;
    this.coverImageError = '';
    this.coverImageInfo = '';
    this.coverImagePreview = null;
  }

  /**
   * Soumettre le formulaire
   */
  async onSubmit(): Promise<void> {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Vérifier le formulaire
    if (this.trackForm.invalid) {
      return;
    }

    // Vérifier qu'un fichier est sélectionné
    if (!this.selectedFile) {
      this.fileError = 'Veuillez sélectionner un fichier audio';
      return;
    }

    this.isLoading = true;

    try {
      // Créer le nouveau track
      const newTrack: Track = {
        id: this.trackService.generateId(),
        title: this.title?.value,
        artist: this.artist?.value,
        description: this.description?.value || '',
        category: this.category?.value,
        duration: 0, // Sera mis à jour lors de la lecture
        addedDate: new Date(),
        fileSize: this.selectedFile.size,
        plays: 0,
        liked: false
      };

      // Ajouter le track avec le fichier audio et l'image de couverture optionnelle
      const createdTrack = await this.trackService.addTrack(newTrack, this.selectedFile, this.selectedCoverImage || undefined);

      // Succès
      this.successMessage = '✅ Track ajouté avec succès!';
      this.resetForm();

      // Rediriger vers la bibliothèque après 1.5 secondes
      setTimeout(() => {
        this.router.navigate(['/library']);
      }, 1500);

    } catch (err: any) {
      this.errorMessage = err.message || 'Erreur lors de l\'ajout du track';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Réinitialiser le formulaire
   */
  resetForm(): void {
    this.trackForm.reset();
    this.selectedFile = null;
    this.fileInfo = '';
    this.fileError = '';
    this.selectedCoverImage = null;
    this.coverImageInfo = '';
    this.coverImageError = '';
    this.coverImagePreview = null;
    this.submitted = false;
    this.errorMessage = '';
  }

  /**
   * Retour à la bibliothèque
   */
  goBack(): void {
    this.router.navigate(['/library']);
  }
}
