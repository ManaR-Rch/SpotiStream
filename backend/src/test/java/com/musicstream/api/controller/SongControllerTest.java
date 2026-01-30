package com.musicstream.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.musicstream.api.dto.SongDTO;
import com.musicstream.api.service.SongService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 🧪 SongControllerTest - Tests d'intégration du controller REST
 * 
 * Tests les endpoints REST et les réponses HTTP
 */
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("SongController - Tests d'Intégration REST")
class SongControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SongService songService;

    @Autowired
    private ObjectMapper objectMapper;

    private SongDTO testSongDTO;
    private SongDTO songDTO2;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Créer un DTO test
        testSongDTO = new SongDTO();
        testSongDTO.setId(1L);
        testSongDTO.setTitle("Imagine");
        testSongDTO.setArtist("John Lennon");
        testSongDTO.setAlbum("Imagine");
        testSongDTO.setGenre("Rock");
        testSongDTO.setCategory("pop");
        testSongDTO.setDuration(183);
        testSongDTO.setAudioUrl("https://example.com/imagine.mp3");
        testSongDTO.setImageUrl("https://example.com/imagine.jpg");

        // Créer un 2ème DTO test
        songDTO2 = new SongDTO();
        songDTO2.setId(2L);
        songDTO2.setTitle("Bohemian Rhapsody");
        songDTO2.setArtist("Queen");
        songDTO2.setCategory("rock");
        songDTO2.setDuration(354);
    }

    // ========== TESTS GET (READ) ==========

    @Test
    @DisplayName("GET /api/songs - Récupérer toutes les chansons")
    void testGetAllSongs() throws Exception {
        // Arrange
        List<SongDTO> songs = new ArrayList<>();
        songs.add(testSongDTO);
        songs.add(songDTO2);
        when(songService.getAllSongs()).thenReturn(songs);

        // Act & Assert
        mockMvc.perform(get("/api/songs")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].title", is("Imagine")))
            .andExpect(jsonPath("$[1].title", is("Bohemian Rhapsody")));

        verify(songService, times(1)).getAllSongs();
    }

    @Test
    @DisplayName("GET /api/songs/{id} - Récupérer une chanson par ID")
    void testGetSongById() throws Exception {
        // Arrange
        when(songService.getSongById(1L)).thenReturn(Optional.of(testSongDTO));

        // Act & Assert
        mockMvc.perform(get("/api/songs/1")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id", is(1)))
            .andExpect(jsonPath("$.title", is("Imagine")))
            .andExpect(jsonPath("$.artist", is("John Lennon")))
            .andExpect(jsonPath("$.category", is("pop")))
            .andExpect(jsonPath("$.duration", is(183)));

        verify(songService, times(1)).getSongById(1L);
    }

    @Test
    @DisplayName("GET /api/songs/{id} - Chanson non trouvée (404)")
    void testGetSongById_NotFound() throws Exception {
        // Arrange
        when(songService.getSongById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/songs/999")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNotFound());

        verify(songService, times(1)).getSongById(999L);
    }

    // ========== TESTS POST (CREATE) ==========

    @Test
    @DisplayName("POST /api/songs - Créer une nouvelle chanson")
    void testCreateSong() throws Exception {
        // Arrange
        when(songService.createSong(any(SongDTO.class))).thenReturn(testSongDTO);

        // Act & Assert
        mockMvc.perform(post("/api/songs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testSongDTO)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id", is(1)))
            .andExpect(jsonPath("$.title", is("Imagine")))
            .andExpect(jsonPath("$.artist", is("John Lennon")));

        verify(songService, times(1)).createSong(any(SongDTO.class));
    }

    @Test
    @DisplayName("POST /api/songs - Retourne HTTP 201 Created")
    void testCreateSong_ReturnsCreated() throws Exception {
        // Arrange
        when(songService.createSong(any(SongDTO.class))).thenReturn(testSongDTO);

        // Act & Assert
        mockMvc.perform(post("/api/songs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testSongDTO)))
            .andExpect(status().isCreated())
            .andExpect(header().exists("Location")); // En-tête Location pour la ressource créée
    }

    // ========== TESTS PUT (UPDATE) ==========

    @Test
    @DisplayName("PUT /api/songs/{id} - Mettre à jour une chanson")
    void testUpdateSong() throws Exception {
        // Arrange
        SongDTO updatedDTO = testSongDTO;
        updatedDTO.setTitle("Imagine (Remastered)");
        updatedDTO.setDuration(185);

        when(songService.updateSong(eq(1L), any(SongDTO.class))).thenReturn(Optional.of(updatedDTO));

        // Act & Assert
        mockMvc.perform(put("/api/songs/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedDTO)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id", is(1)))
            .andExpect(jsonPath("$.title", is("Imagine (Remastered)")))
            .andExpect(jsonPath("$.duration", is(185)));

        verify(songService, times(1)).updateSong(eq(1L), any(SongDTO.class));
    }

    @Test
    @DisplayName("PUT /api/songs/{id} - Chanson non trouvée (404)")
    void testUpdateSong_NotFound() throws Exception {
        // Arrange
        when(songService.updateSong(eq(999L), any(SongDTO.class)))
            .thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(put("/api/songs/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testSongDTO)))
            .andExpect(status().isNotFound());
    }

    // ========== TESTS DELETE ==========

    @Test
    @DisplayName("DELETE /api/songs/{id} - Supprimer une chanson")
    void testDeleteSong() throws Exception {
        // Arrange
        when(songService.deleteSong(1L)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(delete("/api/songs/1"))
            .andExpect(status().isNoContent()); // 204

        verify(songService, times(1)).deleteSong(1L);
    }

    @Test
    @DisplayName("DELETE /api/songs/{id} - Retourne HTTP 204 No Content")
    void testDeleteSong_ReturnsNoContent() throws Exception {
        // Arrange
        when(songService.deleteSong(1L)).thenReturn(true);

        // Act & Assert
        mockMvc.perform(delete("/api/songs/1"))
            .andExpect(status().isNoContent())
            .andExpect(content().string("")); // Body vide
    }

    @Test
    @DisplayName("DELETE /api/songs/{id} - Chanson non trouvée (404)")
    void testDeleteSong_NotFound() throws Exception {
        // Arrange
        when(songService.deleteSong(999L)).thenReturn(false);

        // Act & Assert
        mockMvc.perform(delete("/api/songs/999"))
            .andExpect(status().isNotFound());
    }

    // ========== TESTS RECHERCHE ==========

    @Test
    @DisplayName("GET /api/songs/search/by-title - Rechercher par titre")
    void testSearchByTitle() throws Exception {
        // Arrange
        List<SongDTO> results = new ArrayList<>();
        results.add(testSongDTO);
        when(songService.searchByTitle("imagine")).thenReturn(results);

        // Act & Assert
        mockMvc.perform(get("/api/songs/search/by-title")
                .param("q", "imagine")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].title", is("Imagine")));

        verify(songService, times(1)).searchByTitle("imagine");
    }

    @Test
    @DisplayName("GET /api/songs/search/by-artist - Rechercher par artiste")
    void testSearchByArtist() throws Exception {
        // Arrange
        List<SongDTO> results = new ArrayList<>();
        results.add(testSongDTO);
        when(songService.searchByArtist("lennon")).thenReturn(results);

        // Act & Assert
        mockMvc.perform(get("/api/songs/search/by-artist")
                .param("q", "lennon")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].artist", is("John Lennon")));

        verify(songService, times(1)).searchByArtist("lennon");
    }

    // ========== TESTS FILTRAGE ==========

    @Test
    @DisplayName("GET /api/songs/category/{category} - Filtrer par catégorie")
    void testGetSongsByCategory() throws Exception {
        // Arrange
        List<SongDTO> results = new ArrayList<>();
        results.add(testSongDTO);
        when(songService.getSongsByCategory("pop")).thenReturn(results);

        // Act & Assert
        mockMvc.perform(get("/api/songs/category/pop")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].category", is("pop")));

        verify(songService, times(1)).getSongsByCategory("pop");
    }

    // ========== TESTS HEALTH CHECK ==========

    // Note: L'endpoint /api/health n'est pas implémenté
    // Voir actuator Spring Boot pour les health checks


    // ========== TESTS VALIDATIONS HTTP ==========

    @Test
    @DisplayName("POST /api/songs - Retourne le header Location")
    void testCreateSong_LocationHeader() throws Exception {
        // Arrange
        when(songService.createSong(any(SongDTO.class))).thenReturn(testSongDTO);

        // Act & Assert
        mockMvc.perform(post("/api/songs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testSongDTO)))
            .andExpect(status().isCreated())
            .andExpect(header().exists("Location"))
            .andExpect(header().string("Location", containsString("/api/songs/")));
    }

    @Test
    @DisplayName("GET /api/songs - Retourne le type Content-Type JSON")
    void testGetAllSongs_ContentType() throws Exception {
        // Arrange
        when(songService.getAllSongs()).thenReturn(new ArrayList<>());

        // Act & Assert
        mockMvc.perform(get("/api/songs")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}
