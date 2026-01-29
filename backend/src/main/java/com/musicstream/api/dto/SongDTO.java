package com.musicstream.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 🎵 SongDTO - Data Transfer Object
 * 
 * Un DTO est utilisé pour transférer des données entre le frontend et le backend.
 * C'est DIFFÉRENT de l'Entity:
 * 
 * - Entity: Représente les données en base de données (avec tous les détails)
 * - DTO: Représente les données que nous envoyons au client (format simplifié)
 * 
 * Avantages:
 * ✅ Sécurité: Ne pas exposer toutes les colonnes de la BD
 * ✅ Flexibilité: Pouvoir transformer les données
 * ✅ Performance: Envoyer juste ce qui est nécessaire
 * 
 * Exemple:
 * Entity Song contient: id, title, artist, createdAt, updatedAt, ...
 * DTO SongDTO peut juste contenir: id, title, artist, duration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SongDTO {

    private Long id;
    private String title;
    private String artist;
    private String album;
    private String genre;
    private String category;
    private Integer duration;
    private String audioUrl;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Convertir une Entity Song en DTO
     * 
     * Exemple:
     * Song song = new Song(...);
     * SongDTO dto = SongDTO.fromEntity(song);
     * 
     * @param song L'entity Song
     * @return Le DTO SongDTO
     */
    public static SongDTO fromEntity(com.musicstream.api.entity.Song song) {
        if (song == null) {
            return null;
        }
        return SongDTO.builder()
                .id(song.getId())
                .title(song.getTitle())
                .artist(song.getArtist())
                .album(song.getAlbum())
                .genre(song.getGenre())
                .category(song.getCategory())
                .duration(song.getDuration())
                .audioUrl(song.getAudioUrl())
                .imageUrl(song.getImageUrl())
                .createdAt(song.getCreatedAt())
                .updatedAt(song.getUpdatedAt())
                .build();
    }

    /**
     * Convertir un DTO SongDTO en Entity Song
     * 
     * @return L'entity Song
     */
    public com.musicstream.api.entity.Song toEntity() {
        return com.musicstream.api.entity.Song.builder()
                .id(this.id)
                .title(this.title)
                .artist(this.artist)
                .album(this.album)
                .genre(this.genre)
                .category(this.category)
                .duration(this.duration)
                .audioUrl(this.audioUrl)
                .imageUrl(this.imageUrl)
                .createdAt(this.createdAt)
                .updatedAt(this.updatedAt)
                .build();
    }
}
