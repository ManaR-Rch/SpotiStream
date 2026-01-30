package com.musicstream.api.repository;

import com.musicstream.api.entity.Song;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 🧪 SongRepositoryTest - Tests du Repository JPA
 * 
 * Tests les requêtes personnalisées et les méthodes du repository
 */
@DataJpaTest
@DisplayName("SongRepository - Tests JPA")
class SongRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private SongRepository songRepository;

    private Song testSong;
    private Song testSong2;

    @BeforeEach
    void setUp() {
        // Créer une 1ère chanson
        testSong = new Song();
        testSong.setTitle("Imagine");
        testSong.setArtist("John Lennon");
        testSong.setAlbum("Imagine");
        testSong.setGenre("Rock");
        testSong.setCategory("pop");
        testSong.setDuration(183);
        testSong.setAudioUrl("https://example.com/imagine.mp3");
        testSong.setImageUrl("https://example.com/imagine.jpg");

        // Créer une 2ème chanson
        testSong2 = new Song();
        testSong2.setTitle("Bohemian Rhapsody");
        testSong2.setArtist("Queen");
        testSong2.setAlbum("A Night at the Opera");
        testSong2.setGenre("Rock");
        testSong2.setCategory("rock");
        testSong2.setDuration(354);
        testSong2.setAudioUrl("https://example.com/bohemian.mp3");
        testSong2.setImageUrl("https://example.com/bohemian.jpg");
    }

    // ========== TESTS CREATE (SAVE) ==========

    @Test
    @DisplayName("Sauvegarder une chanson - Succès")
    void testSaveSong_Success() {
        // Act
        Song savedSong = songRepository.save(testSong);
        entityManager.flush();

        // Assert
        assertNotNull(savedSong);
        assertNotNull(savedSong.getId()); // ID généré
        assertEquals("Imagine", savedSong.getTitle());
        assertEquals("John Lennon", savedSong.getArtist());
    }

    @Test
    @DisplayName("Sauvegarder une chanson - Avec timestamps")
    void testSaveSong_WithTimestamps() {
        // Act
        Song savedSong = songRepository.save(testSong);

        // Assert
        assertNotNull(savedSong.getCreatedAt());
        assertNotNull(savedSong.getUpdatedAt());
        assertEquals(savedSong.getCreatedAt(), savedSong.getUpdatedAt());
    }

    // ========== TESTS READ (FIND) ==========

    @Test
    @DisplayName("Récupérer toutes les chansons")
    void testFindAll() {
        // Arrange
        songRepository.save(testSong);
        songRepository.save(testSong2);
        entityManager.flush();

        // Act
        List<Song> songs = songRepository.findAll();

        // Assert
        assertNotNull(songs);
        assertEquals(2, songs.size());
    }

    @Test
    @DisplayName("Récupérer toutes les chansons - Liste vide")
    void testFindAll_Empty() {
        // Act
        List<Song> songs = songRepository.findAll();

        // Assert
        assertNotNull(songs);
        assertEquals(0, songs.size());
    }

    @Test
    @DisplayName("Récupérer une chanson par ID")
    void testFindById_Success() {
        // Arrange
        Song savedSong = songRepository.save(testSong);
        entityManager.flush();

        // Act
        Optional<Song> found = songRepository.findById(savedSong.getId());

        // Assert
        assertTrue(found.isPresent());
        assertEquals("Imagine", found.get().getTitle());
    }

    @Test
    @DisplayName("Récupérer une chanson par ID - Non trouvée")
    void testFindById_NotFound() {
        // Act
        Optional<Song> found = songRepository.findById(999L);

        // Assert
        assertFalse(found.isPresent());
    }

    // ========== TESTS UPDATE ==========

    @Test
    @DisplayName("Mettre à jour une chanson")
    void testUpdateSong() {
        // Arrange
        Song savedSong = songRepository.save(testSong);
        entityManager.flush();

        // Act
        savedSong.setTitle("Imagine (Remastered)");
        savedSong.setDuration(185);
        Song updated = songRepository.save(savedSong);
        entityManager.flush();

        // Assert
        assertEquals("Imagine (Remastered)", updated.getTitle());
        assertEquals(185, updated.getDuration());
    }

    // ========== TESTS DELETE ==========

    @Test
    @DisplayName("Supprimer une chanson")
    void testDeleteSong() {
        // Arrange
        Song savedSong = songRepository.save(testSong);
        entityManager.flush();

        // Act
        songRepository.deleteById(savedSong.getId());
        entityManager.flush();

        // Assert
        Optional<Song> found = songRepository.findById(savedSong.getId());
        assertFalse(found.isPresent());
    }

    @Test
    @DisplayName("Vérifier si une chanson existe")
    void testExistsById() {
        // Arrange
        Song savedSong = songRepository.save(testSong);
        entityManager.flush();

        // Act & Assert
        assertTrue(songRepository.existsById(savedSong.getId()));
        assertFalse(songRepository.existsById(999L));
    }

    // ========== TESTS RECHERCHE CUSTOM ==========

    @Test
    @DisplayName("Rechercher par titre (case-insensitive)")
    void testFindByTitle() {
        // Arrange
        songRepository.save(testSong);
        entityManager.flush();

        // Act
        List<Song> results = songRepository.findByTitleContainingIgnoreCase("Imagine");

        // Assert
        assertEquals(1, results.size());
        assertEquals("Imagine", results.get(0).getTitle());
    }

    @Test
    @DisplayName("Rechercher par titre (case-insensitive)")
    void testFindByTitleContainingIgnoreCase() {
        // Arrange
        songRepository.save(testSong);
        songRepository.save(testSong2);
        entityManager.flush();

        // Act
        List<Song> results = songRepository.findByTitleContainingIgnoreCase("imagine");

        // Assert
        assertEquals(1, results.size());
        assertEquals("Imagine", results.get(0).getTitle());
    }

    @Test
    @DisplayName("Rechercher par titre - Pas de résultat")
    void testFindByTitleContainingIgnoreCase_NotFound() {
        // Arrange
        songRepository.save(testSong);
        entityManager.flush();

        // Act
        List<Song> results = songRepository.findByTitleContainingIgnoreCase("unknown");

        // Assert
        assertEquals(0, results.size());
    }

    @Test
    @DisplayName("Rechercher par artiste (case-insensitive)")
    void testFindByArtistContainingIgnoreCase() {
        // Arrange
        songRepository.save(testSong);
        songRepository.save(testSong2);
        entityManager.flush();

        // Act
        List<Song> results = songRepository.findByArtistContainingIgnoreCase("lennon");

        // Assert
        assertEquals(1, results.size());
        assertEquals("John Lennon", results.get(0).getArtist());
    }

    @Test
    @DisplayName("Rechercher par artiste - Multiple résultats")
    void testFindByArtistContainingIgnoreCase_MultipleResults() {
        // Arrange
        Song song3 = new Song();
        song3.setTitle("Let It Be");
        song3.setArtist("John Lennon & Paul McCartney");
        song3.setCategory("pop");
        song3.setDuration(240);

        songRepository.save(testSong);
        songRepository.save(song3);
        entityManager.flush();

        // Act
        List<Song> results = songRepository.findByArtistContainingIgnoreCase("lennon");

        // Assert
        assertEquals(2, results.size());
    }

    // ========== TESTS FILTRAGE ==========

    @Test
    @DisplayName("Filtrer par catégorie")
    void testFindByCategory() {
        // Arrange
        songRepository.save(testSong); // pop
        songRepository.save(testSong2); // rock
        entityManager.flush();

        // Act
        List<Song> popSongs = songRepository.findByCategory("pop");
        List<Song> rockSongs = songRepository.findByCategory("rock");

        // Assert
        assertEquals(1, popSongs.size());
        assertEquals("pop", popSongs.get(0).getCategory());

        assertEquals(1, rockSongs.size());
        assertEquals("rock", rockSongs.get(0).getCategory());
    }

    @Test
    @DisplayName("Filtrer par catégorie - Pas de résultat")
    void testFindByCategory_NotFound() {
        // Arrange
        songRepository.save(testSong);
        entityManager.flush();

        // Act
        List<Song> results = songRepository.findByCategory("jazz");

        // Assert
        assertEquals(0, results.size());
    }

    @Test
    @DisplayName("Filtrer par artiste exact")
    void testFindByArtist() {
        // Arrange
        songRepository.save(testSong);
        songRepository.save(testSong2);
        entityManager.flush();

        // Act
        List<Song> results = songRepository.findByArtistContainingIgnoreCase("Queen");

        // Assert
        assertEquals(1, results.size());
        assertEquals("Queen", results.get(0).getArtist());
    }

    // ========== TESTS COUNT ==========

    @Test
    @DisplayName("Compter le nombre de chansons")
    void testCount() {
        // Arrange
        songRepository.save(testSong);
        songRepository.save(testSong2);
        entityManager.flush();

        // Act
        long count = songRepository.count();

        // Assert
        assertEquals(2, count);
    }

    @Test
    @DisplayName("Compter les chansons - Aucune")
    void testCount_Empty() {
        // Act
        long count = songRepository.count();

        // Assert
        assertEquals(0, count);
    }
}
