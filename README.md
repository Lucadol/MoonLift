# MoonLift

Application de timer pour l'entraînement fonctionnel (Expo / React Native), avec gestion de programme et suivi des records personnels.

## Fonctionnalités

### Timers
- **AMRAP** : compte à rebours avec compteur de tours (+1 TOUR)
- **EMOM** : intervalle et nombre de tours réglables
- **TABATA** : travail / repos / nombre de tours
- **FOR TIME** : chrono avec time cap et bouton « Terminé »
- 10 s de préparation, bips et vibrations sur les 3 dernières secondes et à chaque changement de phase
- Pause / reprise, écran maintenu allumé pendant le timer

### Programme
- Plusieurs programmes, chacun découpé en séances (ex : « Semaine 1 – Jour 1 »)
- Exercices avec nom, détails et timer associé (optionnel)
- **▶ Lancer** le timer depuis la séance : à la fin, l'exercice peut être **validé** avec un résultat (pré-rempli : tours pour un AMRAP, temps pour un For Time)
- Validation manuelle des exercices sans timer (force, mobilité…)
- Progression de la séance, réordonnancement, duplication et réinitialisation des séances

### Mes PR
- Records par mouvement en kg, lb, reps, temps, mètres ou calories
- Meilleur record mis en avant (le plus court pour un temps), historique avec date et notes

Les données sont enregistrées localement sur le téléphone (AsyncStorage).

## Lancer le projet

```bash
npm install
npm start        # puis scanner le QR code avec Expo Go
npm run web      # version navigateur
```

## Structure

```
App.tsx                      navigation
src/types                    modèles (programme, timer, record)
src/store/StoreContext.tsx   état global + sauvegarde locale
src/utils/timer.ts           moteur de timer (phases, temps écoulé, formatage)
src/utils/records.ts         regroupement et meilleur record
src/components               composants réutilisables
src/screens                  écrans timer, programme et records
```
