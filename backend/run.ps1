# Script PowerShell pour lancer l'application Spring Boot MusicStream API

Write-Host "Starting MusicStream API on port 8080..." -ForegroundColor Green
Write-Host ""

# Change au répertoire du backend
Push-Location $PSScriptRoot

# Compile et lance l'application
& mvn clean compile exec:java -Dexec.mainClass=com.musicstream.api.MusicstreamApiApplication -Dexec.classpathScope=compile

Pop-Location
