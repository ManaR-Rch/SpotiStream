package com.musicstream.api.controller;

import com.musicstream.api.dto.SongDTO;
import com.musicstream.api.service.SongService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 🎵 SongController - API REST pour les chansons
 * 
 * @RestController = Classe qui gère les requêtes HTTP REST
 * @RequestMapping = Préfixe pour toutes les routes: /api/songs
 * @RequiredArgsConstructor = Injection automatique du SongService
 * @Slf4j = Logger automatique
 * 
 * Chaque méthode = un endpoint REST
 * 
 * Convention REST (opérations CRUD):
 * 
 * GET    /api/songs           → Récupérer toutes les chansons
 * GET    /api/songs/{id}      → Récupérer une chanson par ID
 * POST   /api/songs           → Créer une nouvelle chanson
 * PUT    /api/songs/{id}      → Mettre à jour une chanson
 * DELETE /api/songs/{id}      → Supprimer une chanson
 * GET    /api/songs/search    → Rechercher des chansons
 */
@RestController
@RequestMapping("/api/songs")
@RequiredArgsConstructor
@Slf4j
public class SongController {

    private final SongService songService;

    /**
     * GET /api/songs
     * 
     * Récupérer TOUTES les chansons
     * 
     * Exemple curl:
     * curl http://localhost:8080/api/songs
     * 
     * Réponse:
     * [
     *   {
     *     "id": 1,
     *     "title": "Imagine",
     *     "artist": "John Lennon",
     *     "duration": 180
     *   },
     *   ...
     * ]
     * 
     * @return Liste des chansons (HTTP 200)
     */
    @GetMapping
    public ResponseEntity<List<SongDTO>> getAllSongs() {
        log.info("GET /api/songs - Récupération de toutes les chansons");
        List<SongDTO> songs = songService.getAllSongs();
        return ResponseEntity.ok(songs);
    }

    /**
     * GET /api/songs/{id}
     * 
     * Récupérer UNE chanson par ID
     * 
     * Exemple curl:
     * curl http://localhost:8080/api/songs/1
     * 
     * Réponse si trouvée (HTTP 200):
     * {
     *   "id": 1,
     *   "title": "Imagine",
     *   "artist": "John Lennon",
     *   "duration": 180
     * }
     * 
     * Réponse si non trouvée (HTTP 404):
     * (vide)
     * 
     * @param id L'ID de la chanson
     * @return La chanson trouvée (HTTP 200) ou 404 si non trouvée
     */
    @GetMapping("/{id}")
    public ResponseEntity<SongDTO> getSongById(@PathVariable Long id) {
        log.info("GET /api/songs/{} - Récupération d'une chanson", id);
        return songService.getSongById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/songs
     * 
     * CRÉER une nouvelle chanson
     * 
     * Exemple curl:
     * curl -X POST http://localhost:8080/api/songs \
     *   -H "Content-Type: application/json" \
     *   -d '{
     *     "title": "Imagine",
     *     "artist": "John Lennon",
     *     "duration": 180
     *   }'
     * 
     * Réponse (HTTP 201 CREATED):
     * {
     *   "id": 1,
     *   "title": "Imagine",
     *   "artist": "John Lennon",
     *   "duration": 180,
     *   "createdAt": "2026-01-29T14:56:00"
     * }
     * 
     * @param songDTO Les données de la chanson à créer (depuis le JSON du body)
     * @return La chanson créée avec l'ID généré (HTTP 201)
     */
    @PostMapping
    public ResponseEntity<SongDTO> createSong(@RequestBody SongDTO songDTO) {
        log.info("POST /api/songs - Création d'une nouvelle chanson: {}", songDTO.getTitle());
        SongDTO createdSong = songService.createSong(songDTO);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .header("Location", "/api/songs/" + createdSong.getId())
                .body(createdSong);
    }

    /**
     * PUT /api/songs/{id}
     * 
     * METTRE À JOUR une chanson existante
     * 
     * Exemple curl:
     * curl -X PUT http://localhost:8080/api/songs/1 \
     *   -H "Content-Type: application/json" \
     *   -d '{
     *     "title": "Imagine (Remastered)",
     *     "artist": "John Lennon",
     *     "duration": 185
     *   }'
     * 
     * Réponse si trouvée (HTTP 200):
     * { ... chanson mise à jour ... }
     * 
     * Réponse si non trouvée (HTTP 404):
     * (vide)
     * 
     * @param id L'ID de la chanson à mettre à jour
     * @param songDTO Les nouvelles données
     * @return La chanson mise à jour (HTTP 200) ou 404 si non trouvée
     */
    @PutMapping("/{id}")
    public ResponseEntity<SongDTO> updateSong(
            @PathVariable Long id,
            @RequestBody SongDTO songDTO) {
        log.info("PUT /api/songs/{} - Mise à jour d'une chanson", id);
        return songService.updateSong(id, songDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * DELETE /api/songs/{id}
     * 
     * SUPPRIMER une chanson
     * 
     * Exemple curl:
     * curl -X DELETE http://localhost:8080/api/songs/1
     * 
     * Réponse si supprimée (HTTP 204 NO CONTENT):
     * (vide)
     * 
     * Réponse si non trouvée (HTTP 404):
     * (vide)
     * 
     * @param id L'ID de la chanson à supprimer
     * @return 204 No Content si supprimée, 404 si non trouvée
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSong(@PathVariable Long id) {
        log.info("DELETE /api/songs/{} - Suppression d'une chanson", id);
        boolean deleted = songService.deleteSong(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/songs/search/by-title?q=keyword
     * 
     * RECHERCHER par titre
     * 
     * Exemple curl:
     * curl "http://localhost:8080/api/songs/search/by-title?q=imagine"
     * 
     * Réponse (HTTP 200):
     * [
     *   {
     *     "id": 1,
     *     "title": "Imagine",
     *     "artist": "John Lennon",
     *     ...
     *   }
     * ]
     * 
     * @param q Le mot-clé à rechercher
     * @return Liste des chansons trouvées
     */
    @GetMapping("/search/by-title")
    public ResponseEntity<List<SongDTO>> searchByTitle(@RequestParam String q) {
        log.info("GET /api/songs/search/by-title - Recherche par titre: {}", q);
        List<SongDTO> results = songService.searchByTitle(q);
        return ResponseEntity.ok(results);
    }

    /**
     * GET /api/songs/search/by-artist?q=keyword
     * 
     * RECHERCHER par artiste
     * 
     * @param q Le mot-clé à rechercher
     * @return Liste des chansons trouvées
     */
    @GetMapping("/search/by-artist")
    public ResponseEntity<List<SongDTO>> searchByArtist(@RequestParam String q) {
        log.info("GET /api/songs/search/by-artist - Recherche par artiste: {}", q);
        List<SongDTO> results = songService.searchByArtist(q);
        return ResponseEntity.ok(results);
    }

    /**
     * GET /api/songs/category/{category}
     * 
     * Récupérer toutes les chansons d'une catégorie
     * 
     * Exemple curl:
     * curl "http://localhost:8080/api/songs/category/Pop"
     * 
     * @param category La catégorie (Pop, Rock, Jazz, etc.)
     * @return Liste des chansons de cette catégorie
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<List<SongDTO>> getSongsByCategory(@PathVariable String category) {
        log.info("GET /api/songs/category/{} - Récupération des chansons par catégorie", category);
        List<SongDTO> results = songService.getSongsByCategory(category);
        return ResponseEntity.ok(results);
    }
}
