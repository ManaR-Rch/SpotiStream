import { Pipe, PipeTransform } from '@angular/core';

/**
 * DurationPipe - Formate une durée en secondes vers un format lisible
 * 
 * Usage dans les templates:
 * {{ track.duration | duration }}           → "5:30"
 * {{ track.duration | duration:'long' }}    → "5 min 30 sec"
 * {{ track.duration | duration:'full' }}    → "00:05:30"
 * 
 * Exemples:
 * - 90 secondes → "1:30" (format par défaut)
 * - 3600 secondes → "1:00:00"
 * - 0 secondes → "0:00"
 */
@Pipe({
  name: 'duration',
  standalone: true
})
export class DurationPipe implements PipeTransform {

  transform(seconds: number | null | undefined, format: 'short' | 'long' | 'full' = 'short'): string {
    // Gérer les valeurs nulles ou invalides
    if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) {
      return format === 'long' ? '0 sec' : '0:00';
    }

    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    switch (format) {
      case 'long':
        return this.formatLong(hours, minutes, secs);
      case 'full':
        return this.formatFull(hours, minutes, secs);
      case 'short':
      default:
        return this.formatShort(hours, minutes, secs);
    }
  }

  /**
   * Format court: "5:30" ou "1:05:30"
   */
  private formatShort(hours: number, minutes: number, secs: number): string {
    const paddedSecs = secs.toString().padStart(2, '0');
    
    if (hours > 0) {
      const paddedMins = minutes.toString().padStart(2, '0');
      return `${hours}:${paddedMins}:${paddedSecs}`;
    }
    
    return `${minutes}:${paddedSecs}`;
  }

  /**
   * Format long: "5 min 30 sec" ou "1 h 5 min 30 sec"
   */
  private formatLong(hours: number, minutes: number, secs: number): string {
    const parts: string[] = [];
    
    if (hours > 0) {
      parts.push(`${hours} h`);
    }
    if (minutes > 0 || hours > 0) {
      parts.push(`${minutes} min`);
    }
    if (secs > 0 || parts.length === 0) {
      parts.push(`${secs} sec`);
    }
    
    return parts.join(' ');
  }

  /**
   * Format complet: "00:05:30"
   */
  private formatFull(hours: number, minutes: number, secs: number): string {
    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMins = minutes.toString().padStart(2, '0');
    const paddedSecs = secs.toString().padStart(2, '0');
    
    return `${paddedHours}:${paddedMins}:${paddedSecs}`;
  }
}
