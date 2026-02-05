import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Track } from '../models/track.model';
import { DurationPipe } from '../pipes/duration.pipe';

/**
 * Composant Track Card
 * Affiche une card réutilisable pour un track
 * - Image de couverture (ou placeholder)
 * - Titre, artiste, catégorie
 * - Description
 * - Durée formatée avec le pipe
 * - Compteur de lectures et likes
 * - Drag & Drop support
 * - Boutons: play, like, edit, details, delete
 */
@Component({
  selector: 'app-track-card',
  standalone: true,
  imports: [CommonModule, RouterLink, DurationPipe],
  templateUrl: './track-card.component.html',
  styleUrls: ['./track-card.component.css']
})
export class TrackCardComponent {
  @Input() track!: Track;
  @Input() draggable: boolean = true;
  
  @Output() play = new EventEmitter<Track>();
  @Output() delete = new EventEmitter<Track>();
  @Output() like = new EventEmitter<Track>();
  @Output() unlike = new EventEmitter<Track>();
  @Output() reorder = new EventEmitter<{ track: Track, targetId: string }>();

  // État du drag & drop
  isDragging = false;

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
   * Toggle le like
   */
  toggleLike(): void {
    if (this.track.liked) {
      this.unlike.emit(this.track);
    } else {
      this.like.emit(this.track);
    }
  }

  /**
   * Formate la date
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  // ============ DRAG & DROP ============

  /**
   * Début du drag
   */
  onDragStart(event: DragEvent): void {
    if (!this.draggable) return;
    
    this.isDragging = true;
    event.dataTransfer?.setData('text/plain', this.track.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  /**
   * Fin du drag
   */
  onDragEnd(event: DragEvent): void {
    this.isDragging = false;
  }

  /**
   * Autorise le drop
   */
  onDragOver(event: DragEvent): void {
    if (!this.draggable) return;
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  /**
   * Gère le drop
   */
  onDrop(event: DragEvent): void {
    if (!this.draggable) return;
    event.preventDefault();
    
    const draggedTrackId = event.dataTransfer?.getData('text/plain');
    if (draggedTrackId && draggedTrackId !== this.track.id) {
      this.reorder.emit({ 
        track: this.track, 
        targetId: draggedTrackId 
      });
    }
  }
}

