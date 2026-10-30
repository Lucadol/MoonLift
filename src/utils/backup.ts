import { Platform } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'

import { BackupData } from '../store/StoreContext'
import { today } from './records'

// Enregistre la sauvegarde dans un fichier JSON, puis ouvre le partage (Fichiers, iCloud, mail…)
export const shareBackup = async (data: BackupData) => {
  const json = JSON.stringify(data, null, 2)
  const fileName = `moony-sauvegarde-${today()}.json`

  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
    return
  }

  const uri = `${FileSystem.cacheDirectory}${fileName}`
  await FileSystem.writeAsStringAsync(uri, json)
  if (!(await Sharing.isAvailableAsync())) throw new Error('Le partage n’est pas disponible sur cet appareil.')
  await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Sauvegarde Moony', UTI: 'public.json' })
}

// Ouvre un fichier de sauvegarde ; renvoie null si l'utilisateur annule
export const pickBackup = async (): Promise<unknown | null> => {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  })
  if (picked.canceled || !picked.assets?.length) return null
  const asset = picked.assets[0]
  let text: string
  if (Platform.OS === 'web') {
    const blob: Blob = asset.file ? asset.file : await fetch(asset.uri).then(r => r.blob())
    text = await blob.text()
  } else {
    text = await FileSystem.readAsStringAsync(asset.uri)
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Ce fichier n’est pas une sauvegarde Moony valide.')
  }
}
