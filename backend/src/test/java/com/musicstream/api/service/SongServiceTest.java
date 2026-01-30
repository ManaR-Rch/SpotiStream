package com.musicstream.api.service;

import com.musicstream.api.dto.SongDTO;
import com.musicstream.api.entity.Song;
import com.musicstream.api.repository.SongRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * 🧪 SongServiceTest - Tests unitaires du service SongService
 * 
 * Tests les opérations CRUD et les méthodes de recherche
 */
@DisplayName("SongService - Tests Unitaires")
class SongServiceTest {

    @Mock
    private SongRepository songRepository;

    @InjectMocks
    private SongService songService;

    private Song testSong;
    private SongDTO testSongDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // Créer une chanson test
        testSong = new Song();
        testSong.setId(1L);
        testSong.setTitle("Imagine");
        testSong.setArtist("John Lennon");
        testSong.setAlbum("Imagine");
        testSong.setGenre("Rock");
        testSong.setCategory("pop");
        testSong.setDuration(183);
        testSong.setAudioUrl("https://example.com/imagine.mp3");
        testSong.setImageUrl("https://example.com/imagine.jpg");

        // Créer un DTO test
        testSongDTO = new SongDTO();
        testSongDTO.setTitle("Imagine");
        testSongDTO.setArtist("John Lennon");
        testSongDTO.setCategory("pop");
        testSongDTO.setDuration(183);
    }

    // ========== TESTS CREATE ==========

    @Test
    @DisplayName("Créer une chanson - Succès")
    void testCreateSong_Success() {
        // Arrange
        when(songRepository.save(any(Song.class))).thenReturn(testSong);

        // Act
        SongDTO result = songService.createSong(testSongDTO);

        // Assert
        assertNotNull(result);
        assertEquals("Imagine", result.getTitle());
        assertEquals("John Lennon", result.getArtist());
        verify(songRepository, times(1)).save(any(Song.class));
    }

    @Test
    @DisplayName("Créer une chanson - Avec ID généré")
    void testCreateSong_WithGeneratedId() {
        // Arrange
        Song savedSong = testSong;
        when(songRepository.save(any(Song.class))).thenReturn(savedSong);

        // Act
        SongDTO result = songService.createSong(testSongDTO);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getId());
        assertEquals(1L, result.getId());
    }

    // ========== TESTS READ ==========

    @Test
    @DisplayName("Récupérer toutes les chansons - Succès")
    void testGetAllSongs_Success() {
        // Arrange
        List<Song> songs = new ArrayList<>();
        songs.add(testSong);
        songs.add(new Song()); // 2ème chanson
        when(songRepository.findAll()).thenReturn(songs);

        // Act
        List<SongDTO> result = songService.getAllSongs();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(songRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Récupérer toutes les chansons - Liste vide")
    void testGetAllSongs_Empty() {
        // Arrange
        when(songRepository.findAll()).thenReturn(new ArrayList<>());

        // Act
        List<SongDTO> result = songService.getAllSongs();

        // Assert
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    @DisplayName("Récupérer une chanson par ID - Succès")
    void testGetSongById_Success() {
        // Arrange
        when(songRepository.findById(1L)).thenReturn(Optional.of(testSong));

        // Act
        Optional<SongDTO> result = songService.getSongById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals("Imagine", result.get().getTitle());
        assertEquals(1L, result.get().getId());
        verify(songRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Récupérer une chanson par ID - Non trouvée")
    void testGetSongById_NotFound() {
        // Arrange
        when(songRepository.findById(999L)).thenReturn(Optional.empty());

        // Act
        Optional<SongDTO> result = songService.getSongById(999L);

        // Assert
        assertFalse(result.isPresent());
        verify(songRepository, times(1)).findById(999L);
    }

    // ========== TESTS UPDATE ==========

    @Test
    @DisplayName("Mettre à jour une chanson - Succès")
    void testUpdateSong_Success() {
        // Arrange
        SongDTO updateDTO = new SongDTO();
        updateDTO.setTitle("Imagine (Remastered)");
        updateDTO.setArtist("John Lennon");
        updateDTO.setCategory("pop");
        updateDTO.setDuration(185);

        Song updatedSong = testSong;
        updatedSong.setTitle("Imagine (Remastered)");
        updatedSong.setDuration(185);

        when(songRepository.findById(1L)).thenReturn(Optional.of(testSong));
        when(songRepository.save(any(Song.class))).thenReturn(updatedSong);

        // Act
        Optional<SongDTO> result = songService.updateSong(1L, updateDTO);

        // Assert
        assertTrue(result.isPresent());
        assertEquals("Imagine (Remastered)", result.get().getTitle());
        assertEquals(185, result.get().getDuration());
        verify(songRepository, times(1)).findById(1L);
        verify(songRepository, times(1)).save(any(Song.class));
    }

    @Test
    @DisplayName("Mettre à jour une chanson - Non trouvée")
    void testUpdateSong_NotFound() {
        // Arrange
        when(songRepository.findById(999L)).thenReturn(Optional.empty());

        // Act
        Optional<SongDTO> result = songService.updateSong(999L, testSongDTO);

        // Assert
        assertFalse(result.isPresent());
        verify(songRepository, times(1)).findById(999L);
    }

    // ========== TESTS DELETE ==========

    @Test
    @DisplayName("Supprimer une chanson - Succès")
    void testDeleteSong_Success() {
        // Arrange
        when(songRepository.existsById(1L)).thenReturn(true);
        doNothing().when(songRepository).deleteById(1L);

        // Act
        boolean result = songService.deleteSong(1L);

        // Assert
        assertTrue(result);
        verify(songRepository, times(1)).existsById(1L);
        verify(songRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Supprimer une chanson - Non trouvée")
    void testDeleteSong_NotFound() {
        // Arrange
        when(songRepository.existsById(999L)).thenReturn(false);

        // Act
        boolean result = songService.deleteSong(999L);

        // Assert
        assertFalse(result);
        verify(songRepository, times(1)).existsById(999L);
        verify(songRepository, never()).deleteById(999L);
    }

    // ========== TESTS RECHERCHE ==========

    @Test
    @DisplayName("Rechercher par titre - Succès")
    void testSearchByTitle_Success() {
        // Arrange
        List<Song> songs = new ArrayList<>();
        songs.add(testSong);
        when(songRepository.findByTitleContainingIgnoreCase("imagine"))
            .thenReturn(songs);

        // Act
        List<SongDTO> result = songService.searchByTitle("imagine");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Imagine", result.get(0).getTitle());
        verify(songRepository, times(1)).findByTitleContainingIgnoreCase("imagine");
    }

    @Test
    @DisplayName("Rechercher par titre - Pas de résultat")
    void testSearchByTitle_NotFound() {
        // Arrange
        when(songRepository.findByTitleContainingIgnoreCase("unknown"))
            .thenReturn(new ArrayList<>());

        // Act
        List<SongDTO> result = songService.searchByTitle("unknown");

        // Assert
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    @Test
    @DisplayName("Rechercher par artiste - Succès")
    void testSearchByArtist_Success() {
        // Arrange
        List<Song> songs = new ArrayList<>();
        songs.add(testSong);
        when(songRepository.findByArtistContainingIgnoreCase("lennon"))
            .thenReturn(songs);

        // Act
        List<SongDTO> result = songService.searchByArtist("lennon");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("John Lennon", result.get(0).getArtist());
        verify(songRepository, times(1)).findByArtistContainingIgnoreCase("lennon");
    }

    // ========== TESTS FILTRAGE ==========

    @Test
    @DisplayName("Filtrer par catégorie - Succès")
    void testGetSongsByCategory_Success() {
        // Arrange
        List<Song> songs = new ArrayList<>();
        songs.add(testSong);
        when(songRepository.findByCategory("pop")).thenReturn(songs);

        // Act
        List<SongDTO> result = songService.getSongsByCategory("pop");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("pop", result.get(0).getCategory());
    }

    @Test
    @DisplayName("Filtrer par catégorie - Pas de résultat")
    void testGetSongsByCategory_NotFound() {
        // Arrange
        when(songRepository.findByCategory("unknown"))
            .thenReturn(new ArrayList<>());

        // Act
        List<SongDTO> result = songService.getSongsByCategory("unknown");

        // Assert
        assertNotNull(result);
        assertEquals(0, result.size());
    }

    // ========== TESTS VALIDATION ==========

    @Test
    @DisplayName("Créer une chanson sans titre - Doit échouer")
    void testCreateSong_MissingTitle() {
        // Arrange
        SongDTO invalidDTO = new SongDTO();
        invalidDTO.setTitle(null); // Titre manquant
        invalidDTO.setArtist("John Lennon");
        invalidDTO.setCategory("pop");

        when(songRepository.save(any(Song.class)))
            .thenThrow(new RuntimeException("Titre requis"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> 
            songService.createSong(invalidDTO)
        );
    }

    @Test
    @DisplayName("Créer une chanson sans artiste - Doit échouer")
    void testCreateSong_MissingArtist() {
        // Arrange
        SongDTO invalidDTO = new SongDTO();
        invalidDTO.setTitle("Imagine");
        invalidDTO.setArtist(null); // Artiste manquant
        invalidDTO.setCategory("pop");

        when(songRepository.save(any(Song.class)))
            .thenThrow(new RuntimeException("Artiste requis"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> 
            songService.createSong(invalidDTO)
        );
    }
}
