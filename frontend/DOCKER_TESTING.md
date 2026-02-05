# 🧪 Docker Testing Guide

## Prerequisites

Make sure you have:
- ✅ Docker Desktop installed and running
- ✅ Docker Compose installed (comes with Docker Desktop)
- ✅ 2-5 GB free disk space
- ✅ 2+ GB free RAM

## ✅ Verify Docker Installation

```powershell
# Check Docker version
docker --version

# Check Docker Compose version
docker-compose --version

# Verify Docker daemon is running
docker ps
```

Expected output:
```
Docker version 29.0.1, build eedd969
Docker Compose version v2.40.3-desktop.1
CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES
```

---

## 🚀 Quick Start - Option 1: Automated Script (Recommended)

### Windows (PowerShell)

```powershell
# Navigate to project
cd c:\Users\youco\Desktop\mazikni

# Run test script
.\docker-test.ps1
```

### Linux/Mac (Bash)

```bash
# Navigate to project
cd ~/Desktop/mazikni

# Run test script
bash docker-test.sh
```

The script will:
1. ✅ Validate Docker installation
2. ✅ Check docker-compose.yml
3. ✅ Build images (2-5 min)
4. ✅ Start services
5. ✅ Run health checks
6. ✅ Display access points

---

## 🚀 Quick Start - Option 2: Manual Commands

### 1. Navigate to Project

```powershell
cd c:\Users\youco\Desktop\mazikni
```

### 2. Validate Configuration

```powershell
docker-compose config
```

Should show full configuration without errors.

### 3. Build Images

```powershell
docker-compose build
```

Output:
```
[+] Building 120.5s (25/25) FINISHED
 => [backend stage 1/2] FROM maven:3.9.11-eclipse-temurin-17
 => [frontend stage 1/2] FROM node:20-alpine
 ...
```

**⏱️ This takes 2-5 minutes on first build**

### 4. Start Services

```powershell
docker-compose up -d
```

Output:
```
[+] Running 2/2
 ✔ Container musicstream-backend   Started   2.1s
 ✔ Container musicstream-frontend  Started   1.8s
```

### 5. Check Status

```powershell
docker-compose ps
```

Output:
```
NAME                       IMAGE                        STATUS
musicstream-backend        mazikni-backend              Up 15 seconds (healthy)
musicstream-frontend       mazikni-frontend             Up 14 seconds (healthy)
```

### 6. View Logs

```powershell
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

---

## 🧪 Test the Services

### Test Backend API

```powershell
# Get all songs
curl http://localhost:8080/api/songs

# Create a song
curl -X POST http://localhost:8080/api/songs `
  -H "Content-Type: application/json" `
  -d '{"title":"Test","artist":"Artist","duration":180}'

# Get song by ID
curl http://localhost:8080/api/songs/1
```

### Test Frontend

```powershell
# Access frontend
Start-Process http://localhost
```

Or open in browser:
```
http://localhost
```

### Test H2 Database Console

```powershell
# Open H2 console
Start-Process http://localhost:8080/h2-console
```

Or:
```
http://localhost:8080/h2-console
```

JDBC URL: `jdbc:h2:mem:musicstreamdb`

---

## 📊 Docker Statistics

### View Container Stats

```powershell
# Real-time stats
docker stats

# Specific container
docker stats musicstream-backend
```

Output:
```
CONTAINER ID   NAME                    CPU %   MEM USAGE / LIMIT
abc123...      musicstream-backend     0.2%    450MiB / 4GiB
def456...      musicstream-frontend    0.1%    85MiB / 4GiB
```

### View Image Sizes

```powershell
docker images | grep mazikni
```

Output:
```
REPOSITORY           TAG        IMAGE ID      SIZE
mazikni-backend      latest     abc123...     420MB
mazikni-frontend     latest     def456...     95MB
```

---

## 🔍 Troubleshooting

### Problem: Docker Daemon Not Running

**Windows:**
```powershell
# Start Docker Desktop manually from Start Menu
# Or click tray icon and restart

# Wait 30-60 seconds for startup
Start-Sleep -Seconds 30

# Test connection
docker ps
```

### Problem: Port Already in Use

```powershell
# Find process using port 8080
netstat -ano | findstr :8080

# Find process using port 80
netstat -ano | findstr :80

# Kill process (replace PID)
taskkill /PID <PID> /F
```

Then restart:
```powershell
docker-compose restart
```

### Problem: Out of Disk Space

```powershell
# Clean up Docker
docker system prune -a

# Check disk space
Get-Volume
```

### Problem: Build Fails

```powershell
# Clean everything
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache

# Start again
docker-compose up -d
```

### Problem: Services Won't Start

```powershell
# Check logs
docker-compose logs backend
docker-compose logs frontend

# Validate compose file
docker-compose config

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Problem: Health Check Fails

Wait longer for startup:
```powershell
Start-Sleep -Seconds 30
docker-compose ps
```

Then check logs:
```powershell
docker-compose logs backend
```

---

## 📋 Common Commands

```powershell
# Start services
docker-compose up -d

# Stop services (keeps data)
docker-compose stop

# Stop and remove (clears data)
docker-compose down

# Remove everything including volumes
docker-compose down -v

# View logs
docker-compose logs -f

# Follow specific service
docker-compose logs -f backend

# Execute command in container
docker-compose exec backend sh

# Restart services
docker-compose restart

# Rebuild images
docker-compose build

# Rebuild without cache
docker-compose build --no-cache

# Remove containers
docker-compose rm

# Remove images
docker rmi mazikni-frontend mazikni-backend
```

---

## ✅ Success Checklist

- [ ] Docker Desktop is running
- [ ] `docker ps` shows no errors
- [ ] `docker-compose config` validates
- [ ] Images build successfully
- [ ] Containers start with `docker-compose up -d`
- [ ] `docker-compose ps` shows "healthy"
- [ ] Backend responds: `curl http://localhost:8080/api/songs`
- [ ] Frontend responds: `curl http://localhost`
- [ ] Can access http://localhost in browser
- [ ] Can see logs with `docker-compose logs -f`

---

## 🚀 Next Steps After Testing

### If Tests Succeed:
1. ✅ Docker is working correctly
2. ✅ You can deploy to any cloud platform (AWS, Azure, GCP, etc.)
3. ✅ You can push to Docker Hub or GitHub Container Registry
4. ✅ CI/CD pipeline is ready to use

### Deploy to Cloud:

**Docker Hub:**
```powershell
docker tag mazikni-backend:latest yourname/musicstream-backend:latest
docker push yourname/musicstream-backend:latest
```

**GitHub Container Registry:**
```powershell
docker tag mazikni-backend:latest ghcr.io/yourname/musicstream-backend:latest
docker push ghcr.io/yourname/musicstream-backend:latest
```

**Cloud Platforms:**
- AWS ECS / Fargate
- Azure Container Instances
- Google Cloud Run
- Heroku
- DigitalOcean

---

## 📞 Support

If you encounter issues:

1. **Check Docker Desktop:**
   - Make sure it's running
   - Check system requirements
   - Restart if needed

2. **Check Logs:**
   ```powershell
   docker-compose logs backend | tail -50
   ```

3. **Validate Configuration:**
   ```powershell
   docker-compose config
   ```

4. **Clean Rebuild:**
   ```powershell
   docker-compose down -v
   docker-compose build --no-cache
   docker-compose up -d
   ```

---

## 📚 Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)

---

**Status:** ✅ Docker is ready to test!

Generated: 30 January 2026
