import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Track } from '../models/track.model';

/**
 * Composant Track Card
 * Affiche une card réutilisable pour un track
 * - Titre, artiste, catégorie
 * - Description
 * - Bouton pour accéder aux détails
 */
@Component({
  selector: 'app-track-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './track-card.component.html',
  styleUrl: './track-card.component.css'
})
export class TrackCardComponent {
  @Input() track!: Track;
  @Output() play = new EventEmitter<Track>();
  @Output() delete = new EventEmitter<Track>();

  /**
   * Émet l'événement de lecture
   */
  onPlay(): void {
    this.play.emit(this.track);
  }

  /**
   * Émet l'événement de suppression
   */
  onDelete(): void {
    this.delete.emit(this.track);
  }

  /**
   * Formate la date
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }
}
