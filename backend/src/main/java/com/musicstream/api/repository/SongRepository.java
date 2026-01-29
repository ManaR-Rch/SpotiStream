package com.musicstream.api.repository;

import com.musicstream.api.entity.Song;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 🎵 SongRepository - Interface pour accéder aux données Song
 * 
 * Spring Data JPA fournit automatiquement les méthodes CRUD:
 * - save(Song) → INSERT ou UPDATE
 * - findById(Long) → SELECT par ID
 * - findAll() → SELECT tous les enregistrements
 * - delete(Song) → DELETE
 * - etc.
 * 
 * Nous pouvons ajouter des méthodes personnalisées:
 * - Spring génère automatiquement la requête SQL basée sur le nom de la méthode
 * 
 * Exemples:
 * - findByTitle(String title) → SELECT * FROM songs WHERE title = ?
 * - findByArtist(String artist) → SELECT * FROM songs WHERE artist = ?
 * - findByCategory(String category) → SELECT * FROM songs WHERE category = ?
 * 
 * @Repository = Enregistre cette interface comme un Spring Bean (service d'accès aux données)
 * JpaRepository<Entity, ID> où:
 * - Entity = La classe à gérer (Song)
 * - ID = Le type de la clé primaire (Long)
 */
@Repository
public interface SongRepository extends JpaRepository<Song, Long> {

    /**
     * Trouver toutes les chansons par artiste
     * 
     * Spring générera:
     * SELECT * FROM songs WHERE artist = ?
     * 
     * @param artist Le nom de l'artiste
     * @return Liste de toutes les chansons de cet artiste
     */
    List<Song> findByArtist(String artist);

    /**
     * Trouver toutes les chansons par catégorie
     * 
     * SELECT * FROM songs WHERE category = ?
     * 
     * @param category La catégorie
     * @return Liste de toutes les chansons de cette catégorie
     */
    List<Song> findByCategory(String category);

    /**
     * Trouver une chanson par titre (exact match)
     * 
     * SELECT * FROM songs WHERE title = ?
     * 
     * @param title Le titre exact
     * @return Optional<Song> (peut être vide si non trouvé)
     */
    Optional<Song> findByTitle(String title);

    /**
     * Trouver les chansons dont le titre contient un terme (recherche)
     * 
     * SELECT * FROM songs WHERE title LIKE ?
     * 
     * @param titleKeyword Le mot-clé à chercher dans le titre
     * @return Liste des chansons trouvées
     */
    List<Song> findByTitleContainingIgnoreCase(String titleKeyword);

    /**
     * Trouver les chansons dont l'artiste contient un terme
     * 
     * SELECT * FROM songs WHERE artist LIKE ?
     * 
     * @param artistKeyword Le mot-clé à chercher dans le nom de l'artiste
     * @return Liste des chansons trouvées
     */
    List<Song> findByArtistContainingIgnoreCase(String artistKeyword);
}
