#!/usr/bin/env pwsh
# Docker Startup and Test Script for Windows

Write-Host "🐳 MusicStream Docker Setup & Test" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker installation
Write-Host "1. Checking Docker installation..." -ForegroundColor Yellow
$dockerVersion = docker --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green

# Check Docker daemon
Write-Host ""
Write-Host "2. Checking Docker daemon..." -ForegroundColor Yellow
$testDocker = docker ps 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Docker daemon is not running" -ForegroundColor Yellow
    Write-Host "💡 Start Docker Desktop manually" -ForegroundColor Cyan
    Write-Host "⏳ Waiting for Docker to start (60 seconds)..." -ForegroundColor Yellow
    
    # Wait for Docker to start
    $maxWait = 60
    $waited = 0
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 2
        $testDocker = docker ps 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker daemon is now running" -ForegroundColor Green
            break
        }
        $waited += 2
        Write-Host "." -NoNewline
    }
    
    if ($waited -ge $maxWait) {
        Write-Host ""
        Write-Host "❌ Docker daemon did not start" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Docker daemon is running" -ForegroundColor Green

# Validate compose file
Write-Host ""
Write-Host "3. Validating docker-compose.yml..." -ForegroundColor Yellow
$composeValid = docker-compose config 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Configuration error" -ForegroundColor Red
    docker-compose config
    exit 1
}

Write-Host "✅ Configuration is valid" -ForegroundColor Green

# Build images
Write-Host ""
Write-Host "4. Building Docker images..." -ForegroundColor Yellow
Write-Host "   (This may take 2-5 minutes)" -ForegroundColor Gray

$buildOutput = docker-compose build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Images built successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    Write-Host $buildOutput
    exit 1
}

# Start services
Write-Host ""
Write-Host "5. Starting services..." -ForegroundColor Yellow
$upOutput = docker-compose up -d 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Services started" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start services" -ForegroundColor Red
    Write-Host $upOutput
    exit 1
}

# Wait for services
Write-Host ""
Write-Host "6. Waiting for services to be ready..." -ForegroundColor Yellow
Write-Host "⏳ Waiting 15 seconds for startup..." -ForegroundColor Gray
Start-Sleep -Seconds 15

# Check backend health
Write-Host ""
Write-Host "7. Testing backend health..." -ForegroundColor Yellow
$maxRetries = 3
$retryCount = 0
$backendHealthy = $false

while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/songs" -UseBasicParsing -TimeoutSec 3
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend is responding" -ForegroundColor Green
            $backendHealthy = $true
            break
        }
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "⏳ Retrying... ($retryCount/$maxRetries)" -ForegroundColor Gray
            Start-Sleep -Seconds 5
        }
    }
}

if (-not $backendHealthy) {
    Write-Host "⚠️  Backend health check failed" -ForegroundColor Yellow
    Write-Host "📋 Backend logs (last 20 lines):" -ForegroundColor Gray
    docker-compose logs backend | Select-Object -Last 20 | Write-Host
}

# Check frontend health
Write-Host ""
Write-Host "8. Testing frontend health..." -ForegroundColor Yellow
$retryCount = 0
$frontendHealthy = $false

while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/" -UseBasicParsing -TimeoutSec 3
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Frontend is responding" -ForegroundColor Green
            $frontendHealthy = $true
            break
        }
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "⏳ Retrying... ($retryCount/$maxRetries)" -ForegroundColor Gray
            Start-Sleep -Seconds 5
        }
    }
}

if (-not $frontendHealthy) {
    Write-Host "⚠️  Frontend health check failed" -ForegroundColor Yellow
    Write-Host "📋 Frontend logs (last 20 lines):" -ForegroundColor Gray
    docker-compose logs frontend | Select-Object -Last 20 | Write-Host
}

# Show services status
Write-Host ""
Write-Host "9. Services Status:" -ForegroundColor Yellow
docker-compose ps

# Display access points
Write-Host ""
Write-Host "✅ MusicStream Docker Environment Status:" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend:    http://localhost"
Write-Host "   Backend API: http://localhost:8080/api"
Write-Host "   H2 Console:  http://localhost:8080/h2-console"
Write-Host ""

if ($backendHealthy -and $frontendHealthy) {
    Write-Host "🎉 All services are healthy and ready!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some services may not be ready yet" -ForegroundColor Yellow
    Write-Host "   (Docker initialization can take some time)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📝 Useful Commands:" -ForegroundColor Cyan
Write-Host "   View all logs:       docker-compose logs -f" -ForegroundColor Gray
Write-Host "   View backend logs:   docker-compose logs -f backend" -ForegroundColor Gray
Write-Host "   View frontend logs:  docker-compose logs -f frontend" -ForegroundColor Gray
Write-Host "   Stop services:       docker-compose down" -ForegroundColor Gray
Write-Host "   Restart services:    docker-compose restart" -ForegroundColor Gray
Write-Host "   Clean rebuild:       docker-compose down -v; docker-compose build --no-cache" -ForegroundColor Gray
Write-Host ""
