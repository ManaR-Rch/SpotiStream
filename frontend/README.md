# 🎨 Frontend - Angular

## Structure du projet

```
src/
├── app/
│   ├── components/           # Composants UI réutilisables
│   │   ├── add-track/
│   │   ├── audio-player/
│   │   └── track-card/
│   │
│   ├── pages/                # Pages principales
│   │   ├── library/
│   │   └── track-detail/
│   │
│   ├── services/             # Services métier
│   │   ├── audio-player.service.ts
│   │   ├── audio-validation.service.ts
│   │   ├── storage.service.ts
│   │   ├── track.service.ts
│   │   └── backend/          # Services backend (API)
│   │
│   ├── models/               # Modèles TypeScript
│   │   └── track.model.ts
│   │
│   ├── store/                # NgRx (sera créé en étape 7)
│   │   ├── actions/
│   │   ├── reducers/
│   │   ├── effects/
│   │   └── selectors/
│   │
│   ├── app.component.*       # Composant racine
│   ├── app.config.ts         # Configuration
│   └── app.routes.ts         # Routes
│
├── index.html
├── main.ts
└── styles.css
```

## Démarrage

```bash
npm install
npm start
```

L'application démarre sur `http://localhost:4200`

## Étapes de mise en œuvre

1. **✅ FAIT** : Composants Angular
2. **✅ FAIT** : Services locaux (stockage local)
3. **En cours** : Services backend (API)
4. **À venir** : NgRx State Management
5. **À venir** : Tests unitaires

## Technologies

- Angular 19
- TypeScript
- RxJS (Observables)
- NgRx (State Management)
- Angular Forms (Reactive)

