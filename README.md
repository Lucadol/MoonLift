# MoonLift

Application de timer pour l'entraînement fonctionnel (Expo / React Native), avec gestion de programme et suivi des records personnels. Historique des versions : [VERSIONS.md](VERSIONS.md).

## Fonctionnalités

### Timers
- **AMRAP** : compte à rebours avec compteur de tours (+1 tour)
- **EMOM** : intervalle et nombre de tours réglables
- **TABATA** : travail / repos / nombre de tours
- **FOR TIME** : chrono avec time cap et bouton « Terminé »
- **MIX** : enchaîne plusieurs blocs (AMRAP, EMOM, Tabata, For Time, repos), avec un résultat par bloc
- 10 s de préparation, bips et vibrations sur les 3 dernières secondes et à chaque changement de phase
- Écran en couleur pendant le travail, mascotte animée, pause / reprise, « Passer le repos », écran maintenu allumé

### Programme
- Plusieurs programmes, chacun découpé en séances (ex : « Semaine 1 – Jour 1 »)
- **Import par copier-coller** : les séances, exercices et timers sont détectés dans le texte
  (`AMRAP 12'`, `EMOM 10 min`, `E2MOM 20'`, `EMOM 12 x 1:30`, `Tabata 8 x 20/10`, `For Time (cap 15')`)
- Exercices avec nom, détails et timer associé (optionnel)
- **▶ Lancer** le timer depuis la séance : à la fin, l'exercice peut être **validé** avec un résultat pré-rempli
- Validation manuelle des exercices sans timer, progression, duplication et réinitialisation des séances
- « Reprendre » la séance en cours depuis l'accueil

### Mes PR
- Records par mouvement en kg, lb, reps, temps, mètres ou calories
- Meilleur record mis en avant (le plus court pour un temps), historique avec date et notes

### Apparence
- Thème clair (fond beige), sombre ou automatique
- 4 palettes : Terre cuite, Sauge & caramel, Nuit & corail, Encre & lin
- « Moony », la mascotte à tête de lune, présente sur chaque écran et utilisée comme logo

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
src/utils/records.ts            regroupement et meilleur record
src/components/mascot           mascotte « Moony » (poses vectorielles)
src/components                  composants réutilisables
src/screens                     écrans timer, programme, records et apparence
```
