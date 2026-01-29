#!/bin/bash
# Script pour lancer l'application Spring Boot MusicStream API

echo "Starting MusicStream API on port 8080..."
echo ""

# Compiler et lancer l'application
mvn clean compile exec:java -Dexec.mainClass="com.musicstream.api.MusicstreamApiApplication" -Dexec.classpathScope=compile
