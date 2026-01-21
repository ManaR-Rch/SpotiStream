import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TrackService } from '../services/track.service';
import { TRACK_VALIDATION } from '../models/track.model';

/**
 * AddTrackComponent - Formulaire pour ajouter/éditer des tracks
 * 
 * Utilise Reactive Forms pour:
 * - Validation côté client
 * - Messages d'erreur
 * - Logique de soumission
 * 
 * Niveau: DÉBUTANT - Code simple et lisible
 */
@Component({
  selector: 'app-add-track',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-track.component.html',
  styleUrl: './add-track.component.css'
})
export class AddTrackComponent implements OnInit {
  trackForm!: FormGroup;
  submitted = false;
  successMessage = '';
  categories = TRACK_VALIDATION.CATEGORIES;

  constructor(
    private formBuilder: FormBuilder,
    private trackService: TrackService
  ) {}

  /**
   * Initialiser le formulaire
   */
  ngOnInit(): void {
    this.createForm();
  }

  /**
   * Créer le formulaire avec les champs et validations
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
   * Getter pour les champs du formulaire
   */
  get title() {
    return this.trackForm.get('title');
  }

  get artist() {
    return this.trackForm.get('artist');
  }

  get description() {
    return this.trackForm.get('description');
  }

  get category() {
    return this.trackForm.get('category');
  }

  /**
   * Soumettre le formulaire
   */
  onSubmit(): void {
    this.submitted = true;

    // Vérifier si le formulaire est valide
    if (this.trackForm.invalid) {
      return;
    }

    // Créer le nouveau track
    const newTrack = {
      id: this.generateId(),
      ...this.trackForm.value,
      duration: 0,
      addedDate: new Date(),
      plays: 0,
      liked: false
    };

    // Ajouter le track
    this.trackService.addTrack(newTrack);

    // Afficher le message de succès
    this.successMessage = '✅ Track ajouté avec succès!';

    // Réinitialiser le formulaire
    this.trackForm.reset();
    this.submitted = false;

    // Masquer le message après 3 secondes
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  /**
   * Générer un ID unique
   */
  private generateId(): string {
    return `track-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Réinitialiser le formulaire
   */
  resetForm(): void {
    this.trackForm.reset();
    this.submitted = false;
    this.successMessage = '';
  }
}
