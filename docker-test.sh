#!/bin/bash
# Docker Startup and Test Script

echo "🐳 MusicStream Docker Setup & Test"
echo "===================================="
echo ""

# Check Docker installation
echo "1. Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed"
    exit 1
fi

echo "✅ Docker found: $(docker --version)"

# Check Docker daemon
echo ""
echo "2. Checking Docker daemon..."
if ! docker ps &> /dev/null; then
    echo "⚠️  Docker daemon is not running"
    echo "💡 Windows: Start Docker Desktop"
    echo "💡 Linux: Run: sudo systemctl start docker"
    exit 1
fi

echo "✅ Docker daemon is running"

# Validate compose file
echo ""
echo "3. Validating docker-compose.yml..."
if docker-compose config > /dev/null 2>&1; then
    echo "✅ Configuration is valid"
else
    echo "❌ Configuration error"
    docker-compose config
    exit 1
fi

# Build images
echo ""
echo "4. Building Docker images..."
echo "   This may take 2-5 minutes..."
if docker-compose build --progress=plain; then
    echo "✅ Images built successfully"
else
    echo "❌ Build failed"
    exit 1
fi

# Start services
echo ""
echo "5. Starting services..."
if docker-compose up -d; then
    echo "✅ Services started"
else
    echo "❌ Failed to start services"
    exit 1
fi

# Wait for services
echo ""
echo "6. Waiting for services to be ready..."
sleep 10

# Check backend health
echo ""
echo "7. Testing backend health..."
if curl -f http://localhost:8080/api/songs > /dev/null 2>&1; then
    echo "✅ Backend is responding"
else
    echo "⚠️  Backend not ready yet (this is normal, may take a moment)"
    echo "   Retrying in 10 seconds..."
    sleep 10
    if curl -f http://localhost:8080/api/songs > /dev/null 2>&1; then
        echo "✅ Backend is now responding"
    else
        echo "❌ Backend is not responding"
        docker-compose logs backend | tail -20
    fi
fi

# Check frontend health
echo ""
echo "8. Testing frontend health..."
if curl -f http://localhost/ > /dev/null 2>&1; then
    echo "✅ Frontend is responding"
else
    echo "⚠️  Frontend not ready yet"
    echo "   Retrying in 10 seconds..."
    sleep 10
    if curl -f http://localhost/ > /dev/null 2>&1; then
        echo "✅ Frontend is now responding"
    else
        echo "❌ Frontend is not responding"
        docker-compose logs frontend | tail -20
    fi
fi

# Show services status
echo ""
echo "9. Services Status:"
docker-compose ps

# Display access points
echo ""
echo "✅ MusicStream is running!"
echo ""
echo "📍 Access Points:"
echo "   Frontend:    http://localhost"
echo "   Backend API: http://localhost:8080/api"
echo "   H2 Console:  http://localhost:8080/h2-console"
echo ""
echo "📝 Useful Commands:"
echo "   View logs:           docker-compose logs -f"
echo "   View backend logs:   docker-compose logs -f backend"
echo "   Stop services:       docker-compose down"
echo "   Restart services:    docker-compose restart"
echo ""
