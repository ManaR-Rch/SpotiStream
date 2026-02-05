@echo off
REM Script pour lancer l'application Spring Boot MusicStream API

cd /d "%~dp0"
echo Starting MusicStream API on port 8080...
echo.

REM Compiler et lancer l'application
mvn clean compile exec:java -Dexec.mainClass="com.musicstream.api.MusicstreamApiApplication" -Dexec.classpathScope=runtime

pause
