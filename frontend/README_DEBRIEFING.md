# 📚 MusicStream - Documentation du Debriefing B1-S5

## **Component et Cycle de vie**

### **C'est quoi le cycle de vie d'un component en Angular?**

Le **cycle de vie** d'un composant Angular = L'ensemble des étapes par lesquelles passe un composant depuis sa création jusqu'à sa destruction.

```
1. CRÉATION          2. INITIALISATION      3. UTILISATION        4. DESTRUCTION
├─ Constructor       ├─ ngOnInit            ├─ Affichage          └─ ngOnDestroy
├─ Injection props   └─ Charger les données └─ Interactivité       └─ Libérer ressources
└─ ngOnChanges       └─ Initialiser         └─ Répondre aux
   (si Input change)    l'état                 événements
```

### **Les Hooks (Crochets) du cycle de vie**

Un **hook** = Une fonction qu'Angular appelle automatiquement à un moment spécifique du cycle de vie.

---

## **1️⃣ ngOnInit**

### **Qu'est-ce que c'est?**

`ngOnInit()` = Appelé **une seule fois** après que Angular ait initialisé le composant et ses propriétés input.

**Quand l'utiliser?**

- ✅ Charger les données depuis un service
- ✅ Initialiser des variables
- ✅ S'abonner à des observables
- ✅ Faire des configurations

**Quand NOT l'utiliser?**

- ❌ Dans le constructor (utiliser ngOnInit à la place)

### **Exemple dans le projet:**

#### **1. AudioPlayerComponent**

```typescript
// Fichier: src/app/components/audio-player.component.ts

export class AudioPlayerComponent implements OnInit {
  playerState$: Observable<AudioPlayerState>;
  Math = Math;

  constructor(
    private audioPlayerService: AudioPlayerService,
    private trackService: TrackService,
  ) {
    this.playerState$ = this.audioPlayerService.playerState$;
  }

  /**
   * ngOnInit: Appelé une fois au démarrage du composant
   * Responsabilité: Initialiser la playlist du lecteur
   */
  ngOnInit(): void {
    // Charger les tracks depuis le service
    this.trackService.getTracks().subscribe((tracks) => {
      // Définir la playlist pour la navigation next/previous
      this.audioPlayerService.setPlaylist(tracks);
    });
  }

  // ... autres méthodes
}
```

**Explication pour un débutant:**

```
1. Constructor: Reçoit les services (injection)
2. ngOnInit: Se déclenche automatiquement après le constructor
3. Dans ngOnInit on:
   - Appelle trackService.getTracks()
   - On reçoit les tracks
   - On les passe au audioPlayerService.setPlaylist()
```

#### **2. AddTrackComponent**

```typescript
// Fichier: src/app/components/add-track.component.ts

export class AddTrackComponent implements OnInit {
  trackForm!: FormGroup;
  submitted = false;
  successMessage = "";
  categories = TRACK_VALIDATION.CATEGORIES;

  constructor(
    private formBuilder: FormBuilder,
    private trackService: TrackService,
  ) {}

  /**
   * ngOnInit: Initialiser le formulaire au démarrage
   */
  ngOnInit(): void {
    this.createForm(); // Créer le FormGroup
  }

  /**
   * Créer le formulaire avec validations
   */
  createForm(): void {
    this.trackForm = this.formBuilder.group({
      title: ["", [Validators.required, Validators.maxLength(TRACK_VALIDATION.TITLE_MAX_LENGTH)]],
      artist: ["", [Validators.required]],
      description: ["", [Validators.maxLength(200)]],
      category: ["", [Validators.required]],
    });
  }
}
```

**Explication:**

```
1. ngOnInit() est appelé automatiquement
2. Il appelle createForm()
3. createForm() initialise le FormGroup avec les validations
4. Le formulaire est maintenant prêt à l'emploi
```

#### **3. LibraryComponent**

```typescript
// Fichier: src/app/pages/library.component.ts

export class LibraryComponent implements OnInit {
  tracks$: Observable<Track[]>;
  searchTerm: string = "";
  categories = TRACK_VALIDATION.CATEGORIES;
  selectedCategory: Track["category"] | "all" = "all";

  constructor(
    private trackService: TrackService,
    private audioPlayerService: AudioPlayerService,
  ) {
    this.tracks$ = this.trackService.getTracks();
  }

  /**
   * ngOnInit: Initialiser le composant
   */
  ngOnInit(): void {
    console.log("LibraryComponent initialized");
  }

  /**
   * Charger tous les tracks
   */
  private loadTracks(): void {
    this.tracks$ = this.trackService.getTracks();
  }
}
```

---

## **2️⃣ ngOnChanges**

### **Qu'est-ce que c'est?**

`ngOnChanges()` = Appelé **chaque fois qu'une propriété @Input change**.

**Quand l'utiliser?**

- ✅ Réagir aux changements de propriétés input
- ✅ Faire du traitement spécifique quand une input change
- ✅ Comparer l'ancienne et la nouvelle valeur

**Paramètre:**

```typescript
ngOnChanges(changes: SimpleChanges): void {
  // changes est un objet contenant les changements
  // changes['propertyName'].previousValue = ancienne valeur
  // changes['propertyName'].currentValue = nouvelle valeur
}
```

### **Exemple dans le projet:**

#### **TrackCardComponent**

```typescript
// Fichier: src/app/components/track-card.component.ts

import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from "@angular/core";

export class TrackCardComponent implements OnChanges {
  @Input() track!: Track; // Propriété qui peut changer
  @Output() play = new EventEmitter<Track>();
  @Output() delete = new EventEmitter<Track>();
  @Output() like = new EventEmitter<Track>();

  /**
   * ngOnChanges: Appelé quand @Input track change
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["track"]) {
      console.log("Track a changé!");
      console.log("Ancienne valeur:", changes["track"].previousValue);
      console.log("Nouvelle valeur:", changes["track"].currentValue);
    }
  }

  toggleLike(): void {
    if (this.track.liked) {
      this.unlike.emit(this.track);
    } else {
      this.like.emit(this.track);
    }
  }
}
```

---

## **3️⃣ ngAfterViewInit**

### **Qu'est-ce que c'est?**

`ngAfterViewInit()` = Appelé **après que le template du composant et ses enfants aient été initialisés**.

**Quand l'utiliser?**

- ✅ Accéder aux éléments DOM avec @ViewChild
- ✅ Initialiser des plugins jQuery/externes après le rendu
- ✅ Faire des ajustements DOM

---

## **4️⃣ ngOnDestroy**

### **Qu'est-ce que c'est?**

`ngOnDestroy()` = Appelé **juste avant que le composant soit détruit**.

**Quand l'utiliser?**

- ✅ Se désabonner des observables
- ✅ Nettoyer les timers/intervals
- ✅ Libérer les ressources

**Exemple (bonne pratique):**

```typescript
ngOnDestroy(): void {
  if (this.subscription) {
    this.subscription.unsubscribe();
  }
}
```

---

---

# **Formulaires en Angular**

## **Quelles sont les deux principales méthodes pour créer des formulaires en Angular?**

Il y a **deux approches** principales pour créer des formulaires en Angular:

1. **Template-driven Forms** (Piloté par le template)
2. **Reactive Forms** (Réactif / Programmable)

---

## **1️⃣ Template-driven Forms**

### **Qu'est-ce que c'est?**

Les **Template-driven Forms** = Le formulaire est défini **principalement dans le HTML** (template). Angular crée le modèle automatiquement.

### **Caractéristiques:**

```
✅ Plus simple pour les débutants
✅ Moins de code TypeScript
✅ Validation dans le template avec ngModel
❌ Moins de contrôle
❌ Plus difficile à tester
❌ Pour les formulaires simples
```

### **Exemple - Template-driven (simple):**

```html
<!-- Template HTML -->
<form (ngSubmit)="onSubmit()" #form="ngForm">
  <!-- Champ avec validation dans le template -->
  <input name="email" [(ngModel)]="email" required email />
  <span *ngIf="form.controls['email']?.invalid"> Email invalide </span>

  <button type="submit">Envoyer</button>
</form>
```

```typescript
// TypeScript (très simple!)
export class SimpleFormComponent {
  email: string = "";

  onSubmit(): void {
    console.log("Email:", this.email);
  }
}
```

### **Synthaxe:**

| Concept        | Synthaxe                          | Explication                    |
| -------------- | --------------------------------- | ------------------------------ |
| **ngForm**     | `#form="ngForm"`                  | Référence au formulaire        |
| **ngModel**    | `[(ngModel)]="email"`             | Two-way binding                |
| **Validation** | `required`, `email`, `minlength`  | Règles directement dans l'HTML |
| **Accès**      | `form.controls['email']?.invalid` | Accéder à l'état du champ      |

---

## **2️⃣ Reactive Forms**

### **Qu'est-ce que c'est?**

Les **Reactive Forms** = Le formulaire est défini **dans le TypeScript** avec FormBuilder/FormGroup. Le template est juste une vue.

### **Caractéristiques:**

```
✅ Plus puissant et flexible
✅ Meilleur pour les formulaires complexes
✅ Facile à tester
✅ Validation programmable
✅ Plus de contrôle
❌ Plus de code au départ
❌ Courbe d'apprentissage plus raide
```

### **Exemple - Reactive Forms (dans le projet):**

```typescript
// Fichier: src/app/components/add-track.component.ts

import { FormBuilder, FormGroup, Validators } from "@angular/forms";

export class AddTrackComponent implements OnInit {
  trackForm!: FormGroup;
  submitted = false;

  constructor(private formBuilder: FormBuilder) {}

  /**
   * ngOnInit: Créer le formulaire réactif
   */
  ngOnInit(): void {
    this.createForm();
  }

  /**
   * Créer et configurer le FormGroup
   */
  createForm(): void {
    // FormGroup = Conteneur pour tous les champs
    this.trackForm = this.formBuilder.group({
      // FormControl = Un champ individuel
      // Paramètres: [valeur initiale, validateurs, validateurs asynchrones]

      title: [
        "",
        [
          Validators.required, // Obligatoire
          Validators.maxLength(50), // Max 50 caractères
        ],
      ],

      artist: ["", [Validators.required]],

      description: [
        "",
        [Validators.maxLength(200)], // Optionnel (pas required)
      ],

      category: ["", [Validators.required]],
    });
  }

  /**
   * Getters pour accéder aux champs dans le template
   */
  get title() {
    return this.trackForm.get("title");
  }

  get artist() {
    return this.trackForm.get("artist");
  }

  get description() {
    return this.trackForm.get("description");
  }

  get category() {
    return this.trackForm.get("category");
  }

  /**
   * Traiter la soumission du formulaire
   */
  onSubmit(): void {
    this.submitted = true;

    // Vérifier si le formulaire est valide
    if (this.trackForm.invalid) {
      return; // Ne pas continuer si erreurs
    }

    // Récupérer les valeurs du formulaire
    const newTrack = {
      id: this.generateId(),
      ...this.trackForm.value, // Récupère title, artist, etc.
      duration: 0,
      addedDate: new Date(),
      plays: 0,
      liked: false,
    };

    // Ajouter le track via le service
    this.trackService.addTrack(newTrack);

    // Afficher un message de succès
    this.successMessage = "✅ Track ajouté avec succès!";

    // Réinitialiser le formulaire
    this.trackForm.reset();
    this.submitted = false;

    // Masquer le message après 3 secondes
    setTimeout(() => {
      this.successMessage = "";
    }, 3000);
  }

  /**
   * Réinitialiser le formulaire
   */
  resetForm(): void {
    this.trackForm.reset();
    this.submitted = false;
  }
}
```

### **Template correspondant:**

```html
<!-- Fichier: src/app/components/add-track.component.html -->

<form [formGroup]="trackForm" (ngSubmit)="onSubmit()">
  <!-- Champ: Titre -->
  <div class="form-group">
    <label for="title">Titre *</label>
    <input id="title" type="text" formControlName="title" placeholder="Nom du track" [class.error]="submitted && title?.invalid" />
    <!-- Afficher les erreurs -->
    <div *ngIf="submitted && title?.invalid" class="error-message">
      <span *ngIf="title?.errors?.['required']">Le titre est obligatoire</span>
      <span *ngIf="title?.errors?.['maxlength']"> Max 50 caractères ({{ title?.value?.length }}/50) </span>
    </div>
  </div>

  <!-- Champ: Artiste -->
  <div class="form-group">
    <label for="artist">Artiste *</label>
    <input id="artist" type="text" formControlName="artist" placeholder="Nom de l'artiste" [class.error]="submitted && artist?.invalid" />
    <div *ngIf="submitted && artist?.invalid" class="error-message">
      <span *ngIf="artist?.errors?.['required']">L'artiste est obligatoire</span>
    </div>
  </div>

  <!-- Champ: Description -->
  <div class="form-group">
    <label for="description">Description (optionnel)</label>
    <textarea id="description" formControlName="description" placeholder="Courte description..." [class.error]="submitted && description?.invalid"></textarea>
    <div *ngIf="submitted && description?.invalid" class="error-message">
      <span *ngIf="description?.errors?.['maxlength']"> Max 200 caractères ({{ description?.value?.length }}/200) </span>
    </div>
  </div>

  <!-- Champ: Catégorie -->
  <div class="form-group">
    <label for="category">Catégorie *</label>
    <select id="category" formControlName="category" [class.error]="submitted && category?.invalid">
      <option value="">-- Sélectionner --</option>
      <option *ngFor="let cat of categories" [value]="cat">{{ cat | titlecase }}</option>
    </select>
    <div *ngIf="submitted && category?.invalid" class="error-message">
      <span *ngIf="category?.errors?.['required']">La catégorie est obligatoire</span>
    </div>
  </div>

  <!-- Boutons -->
  <button type="submit" class="btn btn-primary">✓ Ajouter</button>
  <button type="button" (click)="resetForm()" class="btn btn-secondary">Réinitialiser</button>
</form>
```

---

## **📊 Comparaison: Template-driven vs Reactive Forms**

| Aspect                     | Template-driven | Reactive              |
| -------------------------- | --------------- | --------------------- |
| **Définition**             | Dans le HTML    | Dans le TypeScript ✅ |
| **Complexité**             | Simple          | Plus complexe ✅      |
| **Testabilité**            | Difficile       | Facile ✅             |
| **Validation**             | Directives HTML | Code TypeScript ✅    |
| **Contrôle**               | Limité          | Complet ✅            |
| **Formulaires complexes**  | ❌              | ✅ Oui                |
| **Pour débutants**         | ✅ Plus facile  | ❌ Plus dur           |
| **Utilisé dans le projet** | ❌ Non          | ✅ Oui                |

---

## **Pourquoi le projet utilise Reactive Forms?**

Le projet MusicStream utilise **Reactive Forms** parce que:

```
1. ✅ Formulaire avec BEAUCOUP de validations
   - Titre: required + maxlength
   - Artist: required
   - Description: maxlength
   - Category: required

2. ✅ Besoin de contrôle complet
   - Validation personnalisée
   - Gestion d'état du formulaire
   - Messages d'erreur détaillés

3. ✅ Facile à tester
   - Chaque champ peut être testé indépendamment
   - Logic en TypeScript (pas HTML)

4. ✅ Meilleure pratique pour les vrais projets
```

---

## **🎯 Résumé pour un débutant**

```
TEMPLATE-DRIVEN FORMS:
- Formulaire simple? → Utilise Template-driven
- Validation dans le HTML
- ngModel pour le binding
- Plus rapide à développer
- Exemple: Formulaire de login basique

REACTIVE FORMS:
- Formulaire complexe? → Utilise Reactive ✅ (comme dans le projet)
- Validation dans le TypeScript
- formControlName pour le binding
- Plus puissant et testable
- Exemple: Formulaire d'inscription avec beaucoup de champs
```

**Dans ce projet:**

- ✅ Utilisé: **Reactive Forms** avec FormBuilder
- ✅ Validators: required, maxLength, etc.
- ✅ Messages d'erreur: Affichés dynamiquement
- ✅ Soumission: Validation avant traitement
