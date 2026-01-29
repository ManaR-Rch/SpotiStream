package com.musicstream.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 🔗 WebConfig - Configuration CORS
 * 
 * CORS (Cross-Origin Resource Sharing) = Permet aux applications sur des ports différents
 * de communiquer entre elles.
 * 
 * Sans cette configuration:
 * - Angular (4200) ne peut pas appeler l'API (8080)
 * - Le navigateur bloque les requêtes par sécurité
 * 
 * Avec cette configuration:
 * - Angular (4200) peut appeler l'API (8080) sans problème ✅
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Configure CORS pour toutes les routes de l'API
     * 
     * @param registry Configuration CORS
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Appliquer CORS à TOUTES les routes (/api/**)
        registry.addMapping("/api/**")
                // Permettre les requêtes depuis Angular (localhost:4200)
                .allowedOrigins(
                    "http://localhost:4200",        // Développement local Angular
                    "http://127.0.0.1:4200"         // Alternative localhost
                )
                // Méthodes HTTP autorisées
                .allowedMethods(
                    "GET",      // Lire les données
                    "POST",     // Créer des données
                    "PUT",      // Modifier les données
                    "DELETE",   // Supprimer les données
                    "OPTIONS"   // Requêtes de vérification
                )
                // Headers autorisés dans les requêtes
                .allowedHeaders("*")
                // Headers autorisés dans les réponses
                .exposedHeaders("*")
                // Autoriser l'envoi de credentials (cookies, auth tokens)
                .allowCredentials(true)
                // Durée de vie du cache pour les requêtes preflight (en secondes)
                // Les requêtes preflight sont des vérifications que le navigateur fait avant
                // d'envoyer les vraies requêtes
                .maxAge(3600);
    }
}
