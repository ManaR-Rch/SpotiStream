# 🎵 MusicStream - Full Stack Angular + Spring Boot

## 📚 Documentation

Ce projet démontre une **architecture full-stack moderne** avec :
- **Frontend** : Angular (NgRx, TypeScript, Reactive Forms)
- **Backend** : Spring Boot (REST API, JPA, H2/MySQL)

---

## 🗂️ Structure du projet

```
MusicStream/
├── frontend/              # Application Angular
│   ├── src/
│   ├── package.json
│   └── angular.json
│
├── backend/               # API Spring Boot
│   ├── src/
│   ├── pom.xml
│   └── mvn
│
└── README_PROJECT.md      # Ce fichier
```

---

## 🚀 Démarrage rapide

### Frontend (Angular)

```bash
cd frontend
npm install
npm start
```

L'app sera disponible sur : `http://localhost:4200`

### Backend (Spring Boot)

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

L'API sera disponible sur : `http://localhost:8080`

---

## 📋 Fonctionnalités principales

- ✅ Lister les chansons
- ✅ Ajouter une chanson
- ✅ Afficher les détails d'une chanson
- ✅ Lecteur audio intégré
- ✅ Validation des formulaires
- ✅ Stockage en base de données

---

## 🏗️ Architecture

### Frontend (Angular)

```
src/app/
├── components/          # Composants UI
├── pages/               # Pages principales
├── services/            # Services métier
├── models/              # Modèles TypeScript
├── store/               # NgRx (State Management)
│   ├── actions/
│   ├── reducers/
│   ├── effects/
│   └── selectors/
└── app.config.ts        # Configuration
```

### Backend (Spring Boot)

```
src/main/java/com/musicstream/
├── controller/          # REST Endpoints
├── service/             # Logique métier
├── repository/          # Accès données (JPA)
├── entity/              # Modèles JPA
├── dto/                 # Data Transfer Objects
└── config/              # Configuration (CORS, etc)
```

---

## 📝 Conventions Git

Chaque commit doit suivre ce format :

```
type(scope): description

feat:    Nouvelle fonctionnalité
fix:     Correction de bug
chore:   Configurations, dépendances
refactor: Refactorisation du code
docs:    Documentation
test:    Tests
```

Exemples :
```
feat(backend): add SongController REST endpoint
feat(frontend): create music service with NgRx
chore: configure CORS in Spring Boot
fix(frontend): resolve track loading issue
```

---

## 📚 Ressources

- [Angular Documentation](https://angular.io)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [NgRx Documentation](https://ngrx.io)

---

## 👨‍💼 Approche pédagogique

Ce projet est conçu pour être **simple et compréhensible** :
- Code commenté et expliqué
- Pas de complexité inutile
- Bonnes pratiques dès le départ
- Étapes progressives et vérifiables

