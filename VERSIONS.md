# Versions de MoonLift

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
| v2 – Design, Mix & import | dernier commit de la branche | Thème clair beige / sombre, 4 palettes au choix, polices Space Grotesk + Inter, mascotte « Moony » sur chaque écran et nouveau logo, timer MIX, import de programme par copier-coller |
| v1 – Timers, programme & PR | `ad89d9a` | Timers AMRAP / EMOM / Tabata / For Time, programme avec validation des exercices, records personnels |
| v0 – Version de départ | `6a64388` | Accueil, navigation, page EMOM |
