# 🚀 Docker Desktop - Démarrage Complet

## ⚠️ Situation Actuelle

❌ Docker Desktop est **ARRÊTÉ** (daemon non actif)
✅ Docker CLI est installé
✅ Espace disque : ~85 GB disponible (OK)

---

## 🎯 Étapes pour Démarrer Docker

### Step 1: Démarrer Docker Desktop

**Option A : Menu Démarrage (Windows)**
```
1. Appuyez sur la touche Windows
2. Tapez "Docker Desktop"
3. Cliquez sur "Docker Desktop"
4. Attendez 30-60 secondes
```

**Option B : Trouver l'icône Docker**
```
1. Regardez la barre de tâches (en bas à droite)
2. Trouvez l'icône Docker (baleine)
3. Cliquez-la pour ouvrir Docker Desktop
```

**Option C : Via PowerShell (si installé)**
```powershell
& "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
Start-Sleep -Seconds 60
```

### Step 2: Vérifier que Docker est Actif

Après démarrage, ouvre un PowerShell et exécute:

```powershell
# Vérifier Docker
docker ps

# Si tu vois une liste vide (pas d'erreur), c'est BON! ✅
```

Sortie attendue:
```
CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES
```

(La liste est vide car on n'a pas encore de conteneurs en cours d'exécution)

---

## 🐳 Tester Docker Avec MusicStream

Après que Docker Desktop soit démarré:

### Option 1: Script Automatique (Recommandé) ⭐

```powershell
cd c:\Users\youco\Desktop\mazikni
.\docker-test.ps1
```

Le script va:
1. ✅ Vérifier Docker
2. ✅ Construire les images (2-5 min)
3. ✅ Démarrer les services
4. ✅ Tester les health checks
5. ✅ Afficher les points d'accès

### Option 2: Commandes Manuelles

```powershell
# 1. Aller au dossier
cd c:\Users\youco\Desktop\mazikni

# 2. Construire les images
docker-compose build

# 3. Démarrer les services
docker-compose up -d

# 4. Voir le statut
docker-compose ps

# 5. Voir les logs
docker-compose logs -f
```

---

## 🌐 Accéder à l'Application

Une fois les services démarrés, ouvre dans ton navigateur:

| Service | URL | Port |
|---------|-----|------|
| **Frontend** | http://localhost | 80 |
| **Backend API** | http://localhost:8080/api | 8080 |
| **H2 Console** | http://localhost:8080/h2-console | 8080 |

### Tester dans PowerShell:

```powershell
# Tester le frontend
curl http://localhost

# Tester le backend
curl http://localhost:8080/api/songs

# Tester la base de données
curl http://localhost:8080/api/songs
```

---

## ⏱️ Temps Estimé

```
Démarrer Docker Desktop:    30-60 sec
Construire les images:      2-5 min (première fois)
Démarrer les services:      10-15 sec
Tests health check:         5-10 sec
─────────────────────────────────────
Total (première fois):      3-7 minutes
```

(Les builds suivants seront **plus rapides** car Docker cache les étapes)

---

## 🆘 Si Docker Desktop Ne Démarre Pas

### Vérifier l'Installation

```powershell
# Chercher Docker Desktop
Get-ChildItem "C:\Program Files\Docker"

# Chercher le répertoire utilisateur
Get-ChildItem "$env:APPDATA\Docker"
```

### Redémarrer le Service

```powershell
# En tant qu'administrateur:
Restart-Service "Docker"
```

### Réinstaller Docker Desktop

1. Désinstaller Docker Desktop (Ajouter/Supprimer des programmes)
2. Redémarrer l'ordinateur
3. Télécharger Docker Desktop depuis https://www.docker.com/products/docker-desktop
4. Installer et redémarrer

---

## ✅ Checklist Avant de Tester

- [ ] Docker Desktop est **ouvert** et **en cours d'exécution**
- [ ] `docker ps` fonctionne (dans PowerShell)
- [ ] Espace disque disponible: ~5 GB minimum
- [ ] RAM disponible: 2+ GB
- [ ] Les ports 80 et 8080 ne sont pas utilisés
- [ ] Accès Internet (pour télécharger les images de base)

---

## 🛠️ Si Tu as des Problèmes

### Port 80 ou 8080 déjà utilisé

```powershell
# Trouver le processus
netstat -ano | findstr :8080
netstat -ano | findstr :80

# Arrêter le processus (remplace PID)
taskkill /PID 1234 /F
```

### Docker veut trop d'espace disque

```powershell
# Nettoyer les images inutilisées
docker system prune -a

# Vérifier l'espace libre
Get-Volume | Select-Object DriveLetter, SizeRemaining, Size
```

### Les services démarrent mais ne répondent pas

```powershell
# Attendre plus longtemps (docker init peut être lent)
Start-Sleep -Seconds 30

# Vérifier le statut
docker-compose ps

# Voir les logs
docker-compose logs backend
```

---

## 📝 Prochaines Étapes

Une fois que tu as vérifié que Docker fonctionne:

1. ✅ Démarrer Docker Desktop
2. ✅ Exécuter `docker ps` pour confirmer
3. ✅ Exécuter le script `docker-test.ps1`
4. ✅ Accéder à http://localhost dans le navigateur
5. ✅ Célébrer! 🎉

---

## 📚 Ressources

- [Docker Desktop Installation](https://docs.docker.com/desktop/install/windows-install/)
- [Docker Compose Guide](https://docs.docker.com/compose/gettingstarted/)
- [Docker Commands Reference](https://docs.docker.com/engine/reference/commandline/cli/)

---

**💡 Conseil:** Si tu veux que Docker démarre automatiquement au démarrage:
1. Ouvre Docker Desktop
2. Settings → General
3. Coche "Start Docker Desktop when you log in"

---

**Status:** ✅ Tu es prêt à démarrer Docker!

Besoin d'aide? Exécute: `docker-test.ps1` après avoir démarré Docker Desktop

