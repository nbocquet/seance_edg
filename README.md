# Le temps collectif — Genève

Calculateur de coût salarial d’une séance, en HTML, CSS et JavaScript natif. Sans dépendance, CDN, installation ni collecte de données.

## Utilisation

Ouvrir `index.html` directement dans un navigateur. Conserver les fichiers dans le même dossier. Configuration initiale : 6 personnes, classe 21, annuité/niveau 10, durée 60 minutes, sans charges patronales.

Résultat attendu : **401.70 CHF**, sur la base de **66.95 CHF/h/personne**, 13e salaire inclus.

## GitHub Pages

Dépôt cible : https://github.com/nbocquet/seance_edg

Le workflow `.github/workflows/pages.yml` publie les fichiers statiques après un push sur `main` ou `master`. Dans Settings → Pages → Build and deployment → Source, choisir **GitHub Actions**. Le workflow peut également être lancé depuis l’onglet Actions.

URL attendue après une publication réussie : https://nbocquet.github.io/seance_edg/

Le workflow ne publie que les fichiers du calculateur et le PDF source. Les liens sont relatifs, donc compatibles avec le sous-répertoire du site. Aucune compilation et aucun serveur applicatif requis.

Alternative sans workflow : choisir « Deploy from a branch », la branche souhaitée et le dossier `/ (root)` dans Settings → Pages.

La publication est automatisée par GitHub Actions après chaque push sur la branche principale.

## Base de calcul

`salaries.js` contient les 30 classes (4 à 33), chacune avec les 23 niveaux (0 à 22), extraits du PDF fourni, valable dès le 01.01.2024. Les valeurs `hourly` reprennent la colonne « Heure y.c. 13ème » et `annual` le traitement annuel.

Coût = somme(nombre de personnes × taux horaire) × durée en heures × (1 + charges estimées / 100).

Le taux de charges est nul par défaut, car le PDF ne précise pas les cotisations patronales. Les taux horaires incluent déjà le 13e salaire. Le niveau 10 est une sélection de barème, pas une règle automatique de correspondance avec dix années de service.

Le chronomètre fige les réglages jusqu’à sa réinitialisation. Le coût annuel multiplie le coût d’une séance par le nombre de séances renseigné. Toutes les saisies restent en mémoire du navigateur et disparaissent au rechargement.

Outil indépendant, sans affiliation officielle affirmée. Il utilise le barème 2024, pas un barème actualisé.
