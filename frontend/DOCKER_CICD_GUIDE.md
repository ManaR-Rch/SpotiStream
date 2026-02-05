# 🐳 Docker & CI/CD Setup - MusicStream

## Overview

This project is fully containerized with Docker and includes a complete CI/CD pipeline using GitHub Actions.

---

## 📦 Docker Configuration

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Docker Environment                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │    Frontend      │      │    Backend       │   │
│  │  (Nginx + SPA)   │      │  (Spring Boot)   │   │
│  │   Port: 80       │      │   Port: 8080     │   │
│  └────────┬─────────┘      └────────┬─────────┘   │
│           │                         │              │
│           └─────────────┬───────────┘              │
│                         │                          │
│                   Network Bridge                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Files Structure

```
.
├── Dockerfile                 # Frontend (Angular/Nginx)
├── docker-compose.yml         # Orchestration
├── nginx.conf                 # Nginx configuration
├── .dockerignore               # Docker build exclusions
│
├── backend/
│   ├── Dockerfile            # Backend (Spring Boot/Java)
│   ├── .dockerignore         # Backend exclusions
│   ├── pom.xml
│   └── src/
│
└── .github/
    └── workflows/
        └── ci-cd.yml         # CI/CD Pipeline
```

---

## 🚀 Quick Start with Docker

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Build & Run

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Access Application
- Frontend: http://localhost
- Backend API: http://localhost:8080/api/songs
- H2 Console: http://localhost:8080/h2-console

### Test Health
```bash
# Frontend health check
curl http://localhost/

# Backend health check
curl http://localhost:8080/api/songs

# Check running containers
docker ps

# View container logs
docker logs musicstream-frontend
docker logs musicstream-backend
```

---

## 📦 Docker Images

### Frontend Image
```dockerfile
# Multi-stage build
Stage 1: Build Angular app with Node.js
Stage 2: Serve with Nginx Alpine
Result: ~100MB image
```

**Features:**
- ✅ Node.js 20 for build
- ✅ Nginx Alpine for runtime (lightweight)
- ✅ Gzip compression enabled
- ✅ Health checks configured
- ✅ SPA routing with index.html fallback
- ✅ API proxy to backend service
- ✅ Static asset caching

### Backend Image
```dockerfile
# Multi-stage build
Stage 1: Maven build with Java 17
Stage 2: JRE Alpine runtime
Result: ~400MB image
```

**Features:**
- ✅ Maven 3.9.11 for build
- ✅ Java 17 JRE Alpine (lightweight)
- ✅ H2 in-memory database
- ✅ Health checks configured
- ✅ Spring Boot auto-configuration

---

## 🔧 Docker Compose Services

### Service: Frontend
```yaml
Container: musicstream-frontend
Port: 80 (host) → 80 (container)
Health Check: Every 30s
Depends On: backend (healthy)
Network: musicstream-network
```

### Service: Backend
```yaml
Container: musicstream-backend
Port: 8080 (host) → 8080 (container)
Health Check: Every 30s
Database: H2 in-memory
Network: musicstream-network
```

### Network
```yaml
Type: Bridge
Name: musicstream-network
Driver: bridge
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### Pipeline Overview

```
Push to main/develop
        ↓
┌─────────────────────────────────────┐
│    1. Backend Unit Tests (JUnit)    │
│       └─ 51 tests, coverage report  │
└──────────────┬──────────────────────┘
               ↓ (parallel)
    ┌──────────────────────────┐
    │  2. Frontend Build       │
    │  (Angular production)    │
    └──────────────┬───────────┘
                   ↓ (parallel)
    ┌──────────────────────────┐
    │  3. Backend Build        │
    │  (Docker image push)     │
    └──────────────┬───────────┘
                   ↓
┌─────────────────────────────────────┐
│  4. Integration Tests               │
│     └─ Docker Compose health checks │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  5. Security Scanning               │
│     └─ Trivy vulnerability scan     │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  6. Production Deployment (Optional)│
│     └─ Deploy to cloud platform     │
└──────────────┬──────────────────────┘
               ↓
      ✅ Pipeline Success
```

### Workflow Steps

#### 1. **Backend Tests**
```
Trigger: Push to main/develop, PR
Steps:
  - Checkout code
  - Setup Java 17
  - Run unit tests (51 tests)
  - Generate coverage report
  - Upload to Codecov
Status: Must pass before build
```

#### 2. **Frontend Build**
```
Trigger: Always
Steps:
  - Checkout code
  - Setup Node.js 20
  - Install dependencies
  - Run linting
  - Build Angular app
  - Build Docker image
  - Push to registry
```

#### 3. **Backend Build**
```
Trigger: Only on main/develop push
Steps:
  - Wait for tests to pass
  - Build Docker image
  - Push to GitHub Container Registry
  - Cache layers for faster builds
```

#### 4. **Integration Tests**
```
Trigger: Only on main branch
Steps:
  - Build Docker images locally
  - Start services with docker-compose
  - Wait 30 seconds for startup
  - Test backend endpoint
  - Test frontend endpoint
  - Cleanup containers
```

#### 5. **Security Scanning**
```
Trigger: Always
Steps:
  - Run Trivy vulnerability scanner
  - Scan filesystem for vulnerabilities
  - Upload results to GitHub Security tab
```

#### 6. **Notifications**
```
Trigger: Always (on completion)
Steps:
  - Determine pipeline status
  - Send Slack notification
  - Include commit info
```

---

## 📋 Configuration

### Environment Variables (Backend)

Set in `docker-compose.yml`:

```yaml
SPRING_DATASOURCE_URL: jdbc:h2:mem:musicstreamdb
SPRING_DATASOURCE_DRIVERCLASSNAME: org.h2.Driver
SPRING_JPA_HIBERNATE_DDL_AUTO: create-drop
SPRING_H2_CONSOLE_ENABLED: true
LOGGING_LEVEL_ROOT: INFO
LOGGING_LEVEL_COM_MUSICSTREAM: DEBUG
```

### Environment Variables (Frontend)

Set in build context:

```bash
API_URL=http://backend:8080
```

---

## 📊 Container Sizes

| Image | Base | Build Tool | Size |
|-------|------|-----------|------|
| Frontend | Nginx Alpine | Node.js | ~100MB |
| Backend | JRE Alpine | Maven | ~400MB |
| **Total** | - | - | **~500MB** |

---

## 🔐 Security Features

### In Dockerfile
- ✅ Multi-stage builds (smaller images)
- ✅ Alpine base images (minimal surface)
- ✅ Health checks configured
- ✅ Non-root user in backend (optional)
- ✅ Read-only filesystem (optional)

### In CI/CD
- ✅ Trivy vulnerability scanning
- ✅ Container registry authentication
- ✅ Signed commits recommended
- ✅ Branch protection rules
- ✅ Review required before merge

### Best Practices
```dockerfile
✅ Use specific base image versions (not :latest)
✅ Cache layers efficiently
✅ Minimize layer count
✅ Use .dockerignore
✅ Health checks
✅ Proper signal handling
```

---

## 🧪 Testing Commands

### Build Images
```bash
# All images
docker-compose build

# Specific service
docker-compose build backend
docker-compose build frontend

# No cache
docker-compose build --no-cache
```

### Run Services
```bash
# Detached mode (background)
docker-compose up -d

# Foreground with logs
docker-compose up

# Specific service
docker-compose up backend
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service (follow)
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100

# With timestamps
docker-compose logs -f --timestamps
```

### Execute Commands
```bash
# Execute command in running container
docker-compose exec backend ls -la

# Get shell access
docker-compose exec backend /bin/sh

# Run command in new container
docker-compose run backend mvn clean test
```

### Cleanup
```bash
# Stop containers
docker-compose stop

# Remove containers
docker-compose down

# Remove volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

---

## 🚀 Deployment Options

### 1. Docker Swarm
```bash
docker stack deploy -c docker-compose.yml musicstream
```

### 2. Kubernetes
```bash
# Convert docker-compose to k8s manifests
kompose convert -f docker-compose.yml -o k8s/

# Deploy
kubectl apply -f k8s/
```

### 3. Cloud Platforms

**Heroku:**
```bash
heroku container:push web
heroku container:release web
```

**AWS ECS:**
- Push images to ECR
- Create task definitions
- Deploy to Fargate/EC2

**Azure Container Instances:**
```bash
az container create --resource-group rg \
  --name musicstream \
  --image myregistry.azurecr.io/musicstream:latest
```

**Google Cloud Run:**
```bash
gcloud run deploy musicstream \
  --image gcr.io/project/musicstream:latest
```

---

## 📈 Monitoring & Logging

### Docker Logs
```bash
# View logs
docker-compose logs frontend
docker-compose logs backend

# Real-time logs
docker-compose logs -f

# Specific lines
docker-compose logs -f --tail=50
```

### Health Checks
```bash
# Check service status
docker-compose ps

# Service health
docker inspect --format='{{.State.Health.Status}}' container_name
```

### Metrics (Optional)
```bash
# CPU & Memory usage
docker stats

# Container info
docker inspect container_name
```

---

## ⚠️ Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs backend

# Validate compose file
docker-compose config

# Try rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Port already in use
```bash
# Find process using port
netstat -an | grep 8080
# or
lsof -i :8080

# Change port in docker-compose.yml
ports:
  - "8081:8080"
```

### Network issues
```bash
# Check network
docker network inspect musicstream-network

# Test connectivity
docker-compose exec frontend ping backend
```

### Permission denied
```bash
# Add user to docker group
sudo usermod -aG docker $USER

# Logout and login for changes to take effect
newgrp docker
```

---

## 📝 GitHub Actions Secrets

To use the CI/CD pipeline, configure these secrets in GitHub:

1. **GITHUB_TOKEN** (automatic)
2. **SLACK_WEBHOOK_URL** (optional, for notifications)
3. **DOCKER_USERNAME** (if using Docker Hub)
4. **DOCKER_PASSWORD** (if using Docker Hub)

### Set secrets via GitHub UI
1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add: `SLACK_WEBHOOK_URL` = your webhook URL

---

## ✅ Next Steps

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Docker and CI/CD configuration"
   git push origin main
   ```

2. **View pipeline:**
   - Go to GitHub repository
   - Click "Actions" tab
   - Watch workflow run

3. **Configure notifications:**
   - Add Slack webhook (optional)
   - Add environment secrets

4. **Deploy to production:**
   - Configure deployment steps in workflow
   - Add cloud platform credentials

---

## 📚 Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [Angular Production Build](https://angular.io/guide/build)

---

**Status:** ✅ Docker & CI/CD fully configured and ready to use!

Generated: 30 January 2026
