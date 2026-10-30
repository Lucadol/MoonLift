import { Alert, Platform } from 'react-native'

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

// Alert.alert avec boutons ne fonctionne pas sur le web : on utilise window.confirm
export const confirmAction = (
  title: string,
  message: string,
  onConfirm: () => void,
  confirmLabel = 'Supprimer',
) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm()
    return
  }
  Alert.alert(title, message, [
    { text: 'Annuler', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ])
}

export const showMessage = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`)
    return
  }
  Alert.alert(title, message)
}
