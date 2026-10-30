# Moony WOD

Application de timer pour l'entraînement fonctionnel (Expo / React Native), avec gestion de programme et suivi des records personnels. Sa mascotte, Moony, est un petit athlète à tête de lune. Historique des versions : [VERSIONS.md](VERSIONS.md).

## Fonctionnalités

### Timers
- **AMRAP** : compte à rebours avec compteur de tours (+1 tour)
- **EMOM** : intervalle et nombre de tours réglables
- **TABATA** : travail / repos / nombre de tours
- **FOR TIME** : chrono avec time cap et bouton « Terminé »
- **MIX** : enchaîne plusieurs blocs (AMRAP, EMOM, Tabata, For Time, repos), avec un résultat par bloc
- 10 s de préparation, bips et vibrations sur les 3 dernières secondes et à chaque changement de phase
- Écran en couleur pendant le travail, mascotte animée, pause / reprise, « Passer le repos », écran maintenu allumé
- Annonces vocales (« C'est parti », « Repos », « Dernier tour », « Plus qu'une minute »…), désactivables

### Programme
- Plusieurs programmes, chacun découpé en séances (ex : « Semaine 1 – Jour 1 »)
- **Import par copier-coller** : les séances, exercices et timers sont détectés dans le texte
  (`AMRAP 12'`, `EMOM 10 min`, `E2MOM 20'`, `EMOM 12 x 1:30`, `Tabata 8 x 20/10`, `For Time (cap 15')`)
- Exercices avec nom, détails et timer associé (optionnel)
- **▶ Lancer** le timer depuis la séance : à la fin, l'exercice peut être **validé** avec un résultat pré-rempli
- Validation manuelle des exercices sans timer, progression, duplication et réinitialisation des séances
- **Charges calculées depuis les PR** : « Back Squat 5x5 @ 75% » affiche la charge correspondante
- **Minuteur de repos** entre les séries (durée lue dans le texte, ex : « repos 2' »)
- « Reprendre » la séance en cours depuis l'accueil

### Mes PR
- Records par mouvement en kg, lb, reps, temps, mètres ou calories
- Meilleur record mis en avant (le plus court pour un temps), historique avec date et notes
- Graphique de progression et table des charges de travail (50 à 95 %)
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
- Moony présent sur chaque écran (14 poses, expressions, respiration et clignement des yeux) et utilisé comme logo
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
src/components/mascot           Moony (poses vectorielles, visage, animation)
src/components                  composants réutilisables
src/screens                     écrans timer, programme, records, historique et réglages
```
