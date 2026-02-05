# 🧪 SCRIPT DE TEST DES ENDPOINTS DU BACKEND MusicStream

Write-Host "" 
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        🎵  TEST D'INTÉGRATION - MusicStream Backend             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080/api"
$testsPassed = 0
$testsFailed = 0

function Test-Endpoint {
    param([string]$name, [string]$method, [string]$endpoint, [string]$body = $null)
    
    Write-Host "─────────────────────────────────────────" -ForegroundColor DarkCyan
    Write-Host "🧪 $name" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────" -ForegroundColor DarkCyan
    
    try {
        $url = "$baseUrl$endpoint"
        Write-Host "   URL: $method $url"
        
        if ($body) {
            Write-Host "   Body: $body"
        }
        
        $params = @{
            Uri = $url
            Method = $method
            UseBasicParsing = $true
            ErrorAction = 'Stop'
        }
        
        if ($body) {
            $params['ContentType'] = 'application/json'
            $params['Body'] = $body
        }
        
        $response = Invoke-WebRequest @params
        
        Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "   Response:" -ForegroundColor Green
        
        $content = $response.Content
        try {
            $json = $content | ConvertFrom-Json
            $json | ConvertTo-Json -Depth 10 | ForEach-Object { Write-Host "      $_" }
        } catch {
            Write-Host "      $content" | Select-Object -First 200
        }
        
        $global:testsPassed++
        Write-Host ""
        return $response
        
    } catch {
        Write-Host "   ❌ ERREUR: $($_.Exception.Message)" -ForegroundColor Red
        $global:testsFailed++
        Write-Host ""
        return $null
    }
}

# ========== TEST 1: Health Check ==========
Test-Endpoint "TEST 1: Health Check" "GET" "/health"

# ========== TEST 2: Lister les chansons (vide au départ) ==========
Test-Endpoint "TEST 2: GET /api/songs (liste vide)" "GET" "/songs"

# ========== TEST 3: Créer une chanson ==========
$song1 = @{
    title = "Imagine"
    artist = "John Lennon"
    album = "Imagine"
    genre = "Rock"
    category = "pop"
    duration = 183
    audioUrl = "https://example.com/imagine.mp3"
    imageUrl = "https://example.com/imagine.jpg"
} | ConvertTo-Json

Test-Endpoint "TEST 3: POST /api/songs (créer Imagine)" "POST" "/songs" $song1

# ========== TEST 4: Créer une deuxième chanson ==========
$song2 = @{
    title = "Bohemian Rhapsody"
    artist = "Queen"
    album = "A Night at the Opera"
    genre = "Rock"
    category = "rock"
    duration = 354
    audioUrl = "https://example.com/bohemian.mp3"
    imageUrl = "https://example.com/bohemian.jpg"
} | ConvertTo-Json

Test-Endpoint "TEST 4: POST /api/songs (créer Bohemian)" "POST" "/songs" $song2

# ========== TEST 5: Lister toutes les chansons ==========
Test-Endpoint "TEST 5: GET /api/songs (avec 2 chansons)" "GET" "/songs"

# ========== TEST 6: Récupérer une chanson par ID ==========
Test-Endpoint "TEST 6: GET /api/songs/1 (récupérer par ID)" "GET" "/songs/1"

# ========== TEST 7: Mettre à jour une chanson ==========
$updateSong = @{
    title = "Imagine (Remastered)"
    artist = "John Lennon"
    album = "Imagine"
    genre = "Rock"
    category = "pop"
    duration = 185
    audioUrl = "https://example.com/imagine-remastered.mp3"
    imageUrl = "https://example.com/imagine.jpg"
} | ConvertTo-Json

Test-Endpoint "TEST 7: PUT /api/songs/1 (mettre à jour)" "PUT" "/songs/1" $updateSong

# ========== TEST 8: Rechercher par titre ==========
Test-Endpoint "TEST 8: GET /api/songs/search/by-title (recherche 'bohemian')" "GET" "/songs/search/by-title?q=bohemian"

# ========== TEST 9: Rechercher par artiste ==========
Test-Endpoint "TEST 9: GET /api/songs/search/by-artist (recherche 'queen')" "GET" "/songs/search/by-artist?q=queen"

# ========== TEST 10: Filtrer par catégorie ==========
Test-Endpoint "TEST 10: GET /api/songs/category/rock (filtrer par catégorie)" "GET" "/songs/category/rock"

# ========== TEST 11: Créer une troisième chanson ==========
$song3 = @{
    title = "Stairway to Heaven"
    artist = "Led Zeppelin"
    album = "IV"
    genre = "Rock"
    category = "rock"
    duration = 482
    audioUrl = "https://example.com/stairway.mp3"
    imageUrl = "https://example.com/stairway.jpg"
} | ConvertTo-Json

Test-Endpoint "TEST 11: POST /api/songs (créer Stairway)" "POST" "/songs" $song3

# ========== TEST 12: Lister toutes les chansons (avec 3) ==========
Test-Endpoint "TEST 12: GET /api/songs (avec 3 chansons)" "GET" "/songs"

# ========== TEST 13: Supprimer une chanson ==========
Test-Endpoint "TEST 13: DELETE /api/songs/2 (supprimer Bohemian)" "DELETE" "/songs/2"

# ========== TEST 14: Vérifier que la chanson est supprimée ==========
Test-Endpoint "TEST 14: GET /api/songs (après suppression)" "GET" "/songs"

# ========== TEST 15: Essayer de récupérer une chanson supprimée ==========
Write-Host "─────────────────────────────────────────" -ForegroundColor DarkCyan
Write-Host "🧪 TEST 15: GET /api/songs/2 (404 - pas trouvée)" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────" -ForegroundColor DarkCyan
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/songs/2" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "   ❌ Devrait avoir retourné 404!" -ForegroundColor Red
    $global:testsFailed++
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "   ✅ Correctement 404 (Not Found)" -ForegroundColor Green
        $global:testsPassed++
    } else {
        Write-Host "   ❌ Erreur inattendue: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $global:testsFailed++
    }
}
Write-Host ""

# ========== RÉSUMÉ ==========
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                      📊 RÉSUMÉ DES TESTS                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$totalTests = $global:testsPassed + $global:testsFailed
$percentage = if ($totalTests -gt 0) { [int]($global:testsPassed / $totalTests * 100) } else { 0 }

Write-Host ""
Write-Host "✅ Tests réussis:    $($global:testsPassed)" -ForegroundColor Green
Write-Host "❌ Tests échoués:     $($global:testsFailed)" -ForegroundColor $(if ($global:testsFailed -gt 0) { 'Red' } else { 'Green' })
Write-Host "📊 Total:            $totalTests" -ForegroundColor Cyan
Write-Host "📈 Taux de réussite: $percentage%" -ForegroundColor $(if ($percentage -eq 100) { 'Green' } else { 'Yellow' })

Write-Host ""
if ($global:testsFailed -eq 0) {
    Write-Host "🎉 TOUS LES TESTS RÉUSSIS!" -ForegroundColor Green -BackgroundColor Black
} else {
    Write-Host "⚠️  CERTAINS TESTS ONT ÉCHOUÉ" -ForegroundColor Red -BackgroundColor Black
}

Write-Host ""
