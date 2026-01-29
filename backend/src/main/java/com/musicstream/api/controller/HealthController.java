package com.musicstream.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 🎵 HealthController - Contrôleur de vérification de l'API
 * 
 * @RestController = Classe qui gère les requêtes HTTP et retourne JSON
 * @RequestMapping = Préfixe pour toutes les routes de ce contrôleur
 * 
 * Routes :
 * - GET /api/health → Vérifier que l'API fonctionne
 */
@RestController
@RequestMapping("/health")
public class HealthController {

    /**
     * GET /api/health
     * 
     * Retourne un message de bienvenue pour vérifier que l'API fonctionne
     * 
     * @return Message JSON avec le statut
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "✅ API MusicStream est en ligne!");
        response.put("timestamp", System.currentTimeMillis());
        response.put("version", "1.0.0");
        response.put("database", "H2 (en mémoire)");
        
        return ResponseEntity.ok(response);
    }
}
