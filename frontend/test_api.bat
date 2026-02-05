@echo off
REM Script de test des endpoints MusicStream Backend

setlocal enabledelayedexpansion

echo.
echo ============================================================
echo      TEST D'INTEGRATION - MusicStream Backend
echo ============================================================
echo.

set BASE_URL=http://localhost:8080/api

REM Lancer le backend en background
echo [*] Lancement du backend...
start /B "Backend" "C:\Program Files\Java\jdk-17.0.12\bin\java" -jar "C:\Users\youco\Desktop\mazikni\backend\target\musicstream-api-jar-with-dependencies.jar"

echo [*] Attente de 8 secondes pour que le backend démarre...
timeout /t 8 /nobreak

REM Test 1: Health Check
echo.
echo ---------- TEST 1: Health Check ----------
curl -s %BASE_URL%/health
echo.
echo.

REM Test 2: Liste vide
echo ---------- TEST 2: Lister les chansons (vide) ----------
curl -s %BASE_URL%/songs
echo.
echo.

REM Test 3: Créer une chanson
echo ---------- TEST 3: Créer une chanson ----------
curl -X POST -H "Content-Type: application/json" ^
  -d "{\"title\":\"Imagine\",\"artist\":\"John Lennon\",\"duration\":183,\"category\":\"pop\"}" ^
  %BASE_URL%/songs
echo.
echo.

REM Test 4: Créer une deuxième chanson
echo ---------- TEST 4: Créer une deuxième chanson ----------
curl -X POST -H "Content-Type: application/json" ^
  -d "{\"title\":\"Bohemian Rhapsody\",\"artist\":\"Queen\",\"duration\":354,\"category\":\"rock\"}" ^
  %BASE_URL%/songs
echo.
echo.

REM Test 5: Lister les chansons (2)
echo ---------- TEST 5: Lister les chansons (2) ----------
curl -s %BASE_URL%/songs
echo.
echo.

REM Test 6: Récupérer une chanson
echo ---------- TEST 6: Récupérer une chanson par ID ----------
curl -s %BASE_URL%/songs/1
echo.
echo.

REM Test 7: Rechercher par titre
echo ---------- TEST 7: Rechercher par titre ----------
curl -s "%BASE_URL%/songs/search/by-title?q=bohemian"
echo.
echo.

REM Test 8: Rechercher par artiste
echo ---------- TEST 8: Rechercher par artiste ----------
curl -s "%BASE_URL%/songs/search/by-artist?q=lennon"
echo.
echo.

REM Test 9: Mettre à jour
echo ---------- TEST 9: Mettre à jour une chanson ----------
curl -X PUT -H "Content-Type: application/json" ^
  -d "{\"title\":\"Imagine (Remastered)\",\"artist\":\"John Lennon\",\"duration\":185,\"category\":\"pop\"}" ^
  %BASE_URL%/songs/1
echo.
echo.

REM Test 10: Supprimer
echo ---------- TEST 10: Supprimer une chanson ----------
curl -X DELETE %BASE_URL%/songs/2
echo.
echo.

REM Test 11: Vérifier que l'une est supprimée
echo ---------- TEST 11: Lister après suppression ----------
curl -s %BASE_URL%/songs
echo.
echo.

echo ============================================================
echo TESTS TERMINES
echo ============================================================
echo.

pause
