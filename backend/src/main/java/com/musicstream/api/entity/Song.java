package com.musicstream.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 🎵 Song - Entité JPA pour représenter une chanson
 * 
 * @Entity = Cette classe sera mappée à une table "songs" en base de données
 * @Table = Définit le nom de la table
 * 
 * Lombok:
 * @Data = Génère les getters, setters, equals, hashCode, toString
 * @Builder = Permet de créer des objets avec la syntaxe: Song.builder().title("...").build()
 * @NoArgsConstructor = Constructeur sans paramètres
 * @AllArgsConstructor = Constructeur avec tous les paramètres
 */
@Entity
@Table(name = "songs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Song {

    /**
     * ID unique de la chanson
     * @Id = Clé primaire
     * @GeneratedValue = Généré automatiquement par la BD (IDENTITY)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Titre de la chanson
     * @Column = Colonne de la table
     * nullable = false → Le titre est obligatoire
     */
    @Column(nullable = false)
    private String title;

    /**
     * Artiste de la chanson
     */
    @Column(nullable = false)
    private String artist;

    /**
     * Album de la chanson
     */
    @Column
    private String album;

    /**
     * Genre de la chanson
     */
    @Column
    private String genre;

    /**
     * Catégorie (ex: Pop, Rock, Jazz, etc.)
     */
    @Column
    private String category;

    /**
     * Durée en secondes
     */
    @Column
    private Integer duration;

    /**
     * URL ou chemin du fichier audio
     */
    @Column(columnDefinition = "TEXT")
    private String audioUrl;

    /**
     * URL ou chemin de l'image de couverture
     */
    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    /**
     * Date de création en base de données
     * @Temporal = Stocke juste la date/heure
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Date de dernière modification
     */
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Hook JPA: S'exécute automatiquement AVANT d'insérer une nouvelle Song
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * Hook JPA: S'exécute automatiquement AVANT de modifier une Song existante
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
