# Versions de Moony WOD

Chaque itération est enregistrée dans un commit identifié. Pour revenir à une version précédente :

```bash
git log --oneline                 # liste des commits
git checkout <commit>             # consulter une ancienne version (lecture seule)
git checkout ccr-1542d692-tl6kc1  # revenir à la dernière version

# Annuler définitivement une itération (crée un commit qui défait les changements)
git revert <commit>
```

| Itération | Commit | Contenu |
|-----------|--------|---------|
| v5 – Moony V1 & lune du timer | dernier commit de la branche | Retour au premier Moony (silhouette pleine, couleur qui s'adapte au fond), sa lune suit le timer : elle se remplit pendant le travail, décroît pendant le repos, pleine lune à la fin ; nouvelle icône |
| v4 – Séries, commentaires & PR étendus | `e0b9925` | Validation réussi / échec, séries réussies ou ratées avec correction, commentaires, tours ratés pendant un EMOM, PR EMOM / AMRAP / benchmark / course, allure, 1RM estimé, poses squat et deadlift de face, 4 variantes de Moony à choisir |
| v3 – Moony vivant & suivi | `6aad165` | Nom « Moony WOD », Moony redessiné (visage, bandeau, animation), phrase de motivation à l'ouverture, charges calculées depuis les PR, détection de nouveau PR, historique et calendrier, graphique de progression, annonces vocales, sauvegarde / restauration, minuteur de repos |
| v2 – Design, Mix & import | `1a37c51` | Thème clair beige / sombre, 4 palettes au choix, polices Space Grotesk + Inter, mascotte « Moony » sur chaque écran et nouveau logo, timer MIX, import de programme par copier-coller |
| v1 – Timers, programme & PR | `ad89d9a` | Timers AMRAP / EMOM / Tabata / For Time, programme avec validation des exercices, records personnels |
| v0 – Version de départ | `6a64388` | Accueil, navigation, page EMOM |
