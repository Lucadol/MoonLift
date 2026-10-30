# Moony WOD

Application de timer pour l'entraînement fonctionnel (Expo / React Native), avec gestion de programme et suivi des records personnels. Sa mascotte, Moony, est une silhouette d'athlète à tête de lune. Historique des versions : [VERSIONS.md](VERSIONS.md).

## Fonctionnalités

### Timers
- **AMRAP** : compte à rebours avec compteur de tours (+1 tour)
- **EMOM** : intervalle et nombre de tours réglables
- **TABATA** : travail / repos / nombre de tours
- **FOR TIME** : chrono avec time cap et bouton « Terminé »
- **MIX** : enchaîne plusieurs blocs (AMRAP, EMOM, Tabata, For Time, repos), avec un résultat par bloc
- 10 s de préparation, bips et vibrations sur les 3 dernières secondes et à chaque changement de phase
- Écran en couleur pendant le travail, pause / reprise, « Passer le repos », écran maintenu allumé
- **La lune de Moony suit le timer** : elle se remplit pendant le travail (sur tout l'AMRAP / For Time, à chaque tour d'EMOM / Tabata), décroît pendant la préparation et le repos, et devient pleine à la fin
- Annonces vocales (« C'est parti », « Repos », « Dernier tour », « Plus qu'une minute »…), désactivables

### Programme
- Plusieurs programmes, chacun découpé en séances (ex : « Semaine 1 – Jour 1 »)
- **Import par copier-coller** : les séances, exercices et timers sont détectés dans le texte
  (`AMRAP 12'`, `EMOM 10 min`, `E2MOM 20'`, `EMOM 12 x 1:30`, `Tabata 8 x 20/10`, `For Time (cap 15')`)
- Exercices avec nom, détails et timer associé (optionnel)
- **▶ Lancer** le timer depuis la séance : à la fin, l'exercice peut être **validé** avec un résultat pré-rempli
- **Validation détaillée** : réussi / échec, séries réussies ou ratées (avec correction : « 3 reps », « 95 kg »), résultat et commentaire ; une validation se corrige ou s'annule ensuite
- Pendant un EMOM ou un Tabata, bouton « Tour raté » : le tour est pré-marqué en échec à la validation
- Duplication et réinitialisation des séances
- **Charges calculées depuis les PR** : « Back Squat 5x5 @ 75% » affiche la charge correspondante
- **Minuteur de repos** entre les séries (durée lue dans le texte, ex : « repos 2' »)
- « Reprendre » la séance en cours depuis l'accueil

### Mes PR
- Catégories : charge max (1RM, 3RM, 5RM…), EMOM / séries réussies, max reps, benchmark chronométré, AMRAP (tours + reps), course / cardio (course, rameur, SkiErg, vélo, natation, avec l'allure), distance ou calories
- « Enregistrer comme PR » depuis un exercice validé : formulaire pré-rempli (mouvement, format de l'EMOM, charge…)
- Meilleur record mis en avant (le plus court pour un temps), historique avec date et notes
- Graphique de progression et table des charges de travail (50 à 95 %, à partir d'un 1RM estimé pour un 3RM ou 5RM)
- **Nouveau PR détecté** quand un résultat validé bat le record du mouvement

### Historique
- Calendrier des jours d'entraînement, série de semaines consécutives
- Exercices validés et timers terminés, avec leur résultat

### Réglages
- Annonces vocales, bips et vibrations
- Export de toutes les données dans un fichier et restauration d'une sauvegarde

### Apparence
- Thème clair (fond beige), sombre ou automatique
- 4 palettes : Terre cuite, Sauge & caramel, Nuit & corail, Encre & lin
- Moony présent sur chaque écran (14 poses) et utilisé comme logo ; il prend la couleur lisible du fond sur lequel il est posé
- Une phrase de motivation différente à chaque ouverture de l'app

Les données sont enregistrées localement sur le téléphone (AsyncStorage).

## Lancer le projet

```bash
npm install
npm start        # puis scanner le QR code avec Expo Go
npm run web      # version navigateur
```

## Structure

```
App.tsx                         navigation, polices
src/theme                       palettes, thème clair / sombre, makeStyles
src/types                       modèles (programme, timer, record)
src/store/StoreContext.tsx      état global + sauvegarde locale
src/utils/timer.ts              moteur de timer (phases, blocs MIX, formatage)
src/utils/importProgram.ts      analyse d'un programme collé en texte
src/utils/records.ts            meilleur record, charges en %, détection de nouveau PR
src/utils/history.ts            calendrier et séries de semaines
src/utils/backup.ts             export / restauration des données
src/constants                   nom de l'app, phrases de motivation
src/components/mascot           Moony (poses vectorielles, phases de lune, respiration)
src/components                  composants réutilisables
src/screens                     écrans timer, programme, records, historique et réglages
```
