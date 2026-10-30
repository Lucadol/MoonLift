import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Phrases de motivation affichées sous le logo : un peu décalées, mais qui donnent envie d'y aller
export const quotes = [
  'Le canapé t’a assez vu aujourd’hui.',
  'Tes muscles ne vont pas se soulever tout seuls.',
  'Même la lune fait des tours. Fais-en un de plus.',
  'Les burpees, on ne les aime pas. Mais eux nous aiment.',
  'Transpire aujourd’hui, frime demain.',
  'La barre ne juge pas. Enfin, un peu.',
  'Ta zone de confort a appelé. On n’a pas décroché.',
  'Respire. Gaine. Pousse. Râle après.',
  'Le time cap n’attend personne. Surtout pas toi.',
  'Petit rappel : les jambes, ça se travaille aussi.',
  'Aujourd’hui on soulève, demain on râle des courbatures.',
  'Moony a déjà fini son échauffement. Et toi ?',
  'Chaque rep compte. Même celles que tu comptes mal.',
  'La motivation, c’est bien. L’habitude, c’est mieux.',
  'Les excuses ne brûlent aucune calorie.',
  'Ton futur toi te remercie déjà. Ton toi de demain matin, un peu moins.',
  '3, 2, 1… non, pas le canapé.',
  'Lever de lune, lever de fonte.',
  'Fais-le pour la photo allongé par terre après le WOD.',
  'Le wall ball ne va pas se lancer tout seul.',
  'Le dernier tour est toujours le meilleur. Parce que c’est le dernier.',
  'Tu n’es pas fatigué, tu es en mode économie d’énergie.',
  'Mange. Dors. Soulève. Recommence.',
  'Ton PR d’aujourd’hui sera ton échauffement de demain.',
  'On ne négocie pas avec le chrono.',
  'Le sol est très confortable. Après la séance.',
  'Les courbatures, ce sont juste des souvenirs de la dernière fois.',
  'Pas de magie, juste des reps.',
  'Si c’était facile, ça s’appellerait la sieste.',
  'Une séance ratée, ça n’existe pas. Une séance zappée, si.',
  'Ton rameur s’ennuie. Va lui dire bonjour.',
  'Lent, c’est toujours plus rapide que le canapé.',
  'Les kilos ne se soulèvent pas en scrollant.',
  'Aujourd’hui, tu bats quelqu’un : toi d’hier.',
  'Sueur aujourd’hui, selfie demain.',
]

const LAST_QUOTE_KEY = 'moonlift:lastQuote'

// Une nouvelle phrase à chaque ouverture de l'app (jamais deux fois la même d'affilée)
export const useLaunchQuote = () => {
  const [quote, setQuote] = useState<string | null>(null)

  useEffect(() => {
    AsyncStorage.getItem(LAST_QUOTE_KEY)
      .catch(() => null)
      .then(last => {
        const lastIndex = last === null ? -1 : parseInt(last, 10)
        let index = Math.floor(Math.random() * quotes.length)
        if (index === lastIndex) index = (index + 1) % quotes.length
        setQuote(quotes[index])
        AsyncStorage.setItem(LAST_QUOTE_KEY, `${index}`).catch(() => {})
      })
  }, [])

  return quote
}
