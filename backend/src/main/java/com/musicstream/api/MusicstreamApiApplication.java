package com.musicstream.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 🎵 MusicStream API - Classe principale Spring Boot
 * 
 * @SpringBootApplication = Configuration automatique + Component Scan + Enable AutoConfiguration
 * 
 * Cette classe démarre l'application Spring Boot sur le port 8080
 */
@SpringBootApplication
public class MusicstreamApiApplication {

    /**
     * Point d'entrée de l'application
     * 
     * @param args arguments de ligne de commande
     */
    public static void main(String[] args) {
        SpringApplication.run(MusicstreamApiApplication.class, args);
    }
}
