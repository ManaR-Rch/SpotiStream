package com.musicstream.api.service;

import com.musicstream.api.dto.SongDTO;
import com.musicstream.api.entity.Song;
import com.musicstream.api.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 🎵 SongService - Service métier pour les chansons
 * 
 * @Service = Enregistre cette classe comme un Spring Bean (service)
 * @Transactional = Gère automatiquement les transactions base de données
 * @Slf4j = Génère un logger automatiquement (log.info, log.error, etc.)
 * @RequiredArgsConstructor = Crée un constructeur avec les dépendances (SongRepository)
 * 
 * Le Service contient:
 * ✅ La logique métier (validation, transformation, etc.)
 * ✅ L'accès aux données via le Repository
 * ❌ PAS la gestion des requêtes HTTP (c'est le Controller)
 * 
 * Règle importante:
 * Service → Repository (oui, le service utilise le repo)
 * Service ← Repository (non, le repo ne connaît pas le service)
 */
@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class SongService {

    private final SongRepository songRepository;

    /**
     * Récupérer TOUTES les chansons
     * 
     * @return Liste de tous les DTOs des chansons
     */
    public List<SongDTO> getAllSongs() {
        log.info("Récupérant toutes les chansons");
        return songRepository.findAll()
                .stream()
                .map(SongDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer une chanson par ID
     * 
     * @param id L'ID de la chanson
     * @return Optional<SongDTO> (peut être vide si pas trouvée)
     */
    public Optional<SongDTO> getSongById(Long id) {
        log.info("Récupérant la chanson avec l'ID: {}", id);
        return songRepository.findById(id)
                .map(SongDTO::fromEntity);
    }

    /**
     * Créer une nouvelle chanson
     * 
     * @param songDTO Les données de la chanson à créer
     * @return Le DTO de la chanson créée (avec l'ID généré)
     */
    public SongDTO createSong(SongDTO songDTO) {
        log.info("Création d'une nouvelle chanson: {}", songDTO.getTitle());
        
        // Convertir DTO en Entity
        Song song = songDTO.toEntity();
        
        // Les dates seront définies automatiquement par @PrePersist
        song.setId(null); // S'assurer que c'est une nouvelle insertion
        
        // Sauvegarder en base de données
        Song savedSong = songRepository.save(song);
        
        log.info("Chanson créée avec l'ID: {}", savedSong.getId());
        return SongDTO.fromEntity(savedSong);
    }

    /**
     * Mettre à jour une chanson existante
     * 
     * @param id L'ID de la chanson à mettre à jour
     * @param songDTO Les nouvelles données
     * @return Optional<SongDTO> (contient la chanson modifiée)
     */
    public Optional<SongDTO> updateSong(Long id, SongDTO songDTO) {
        log.info("Mise à jour de la chanson avec l'ID: {}", id);
        
        return songRepository.findById(id).map(song -> {
            // Mettre à jour les champs
            song.setTitle(songDTO.getTitle());
            song.setArtist(songDTO.getArtist());
            song.setAlbum(songDTO.getAlbum());
            song.setGenre(songDTO.getGenre());
            song.setCategory(songDTO.getCategory());
            song.setDuration(songDTO.getDuration());
            song.setAudioUrl(songDTO.getAudioUrl());
            song.setImageUrl(songDTO.getImageUrl());
            
            // @PreUpdate mettra à jour automatiquement updatedAt
            Song updatedSong = songRepository.save(song);
            log.info("Chanson mise à jour: {}", id);
            return SongDTO.fromEntity(updatedSong);
        });
    }

    /**
     * Supprimer une chanson
     * 
     * @param id L'ID de la chanson à supprimer
     * @return true si la chanson a été supprimée, false si elle n'existait pas
     */
    public boolean deleteSong(Long id) {
        log.info("Suppression de la chanson avec l'ID: {}", id);
        
        if (songRepository.existsById(id)) {
            songRepository.deleteById(id);
            log.info("Chanson supprimée: {}", id);
            return true;
        }
        log.warn("Tentative de suppression d'une chanson inexistante: {}", id);
        return false;
    }

    /**
     * Rechercher des chansons par titre
     * 
     * @param keyword Le mot-clé à chercher dans le titre
     * @return Liste des chansons trouvées
     */
    public List<SongDTO> searchByTitle(String keyword) {
        log.info("Recherche de chansons par titre: {}", keyword);
        return songRepository.findByTitleContainingIgnoreCase(keyword)
                .stream()
                .map(SongDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Rechercher des chansons par artiste
     * 
     * @param keyword Le mot-clé à chercher dans le nom de l'artiste
     * @return Liste des chansons trouvées
     */
    public List<SongDTO> searchByArtist(String keyword) {
        log.info("Recherche de chansons par artiste: {}", keyword);
        return songRepository.findByArtistContainingIgnoreCase(keyword)
                .stream()
                .map(SongDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Récupérer toutes les chansons d'une catégorie
     * 
     * @param category La catégorie
     * @return Liste des chansons de cette catégorie
     */
    public List<SongDTO> getSongsByCategory(String category) {
        log.info("Récupérant les chansons de la catégorie: {}", category);
        return songRepository.findByCategory(category)
                .stream()
                .map(SongDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
