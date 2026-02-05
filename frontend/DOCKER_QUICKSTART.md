# 🚀 Docker Quick Start

## One-Command Setup

```bash
# Clone and run
git clone <your-repo>
cd mazikni
docker-compose up -d
```

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost | Angular app |
| Backend API | http://localhost:8080/api | REST API |
| H2 Console | http://localhost:8080/h2-console | Database |

## Common Commands

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

## Health Check

```bash
# Frontend
curl http://localhost/

# Backend
curl http://localhost:8080/api/songs

# All services
docker-compose ps
```

## Troubleshooting

```bash
# View error logs
docker-compose logs backend | tail -50

# Rebuild and start fresh
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Check if ports are available
netstat -an | grep "8080\|80"
```

✅ **Ready to go!** Your MusicStream is running in Docker.
