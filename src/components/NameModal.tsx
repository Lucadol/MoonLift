import { useEffect, useState } from 'react'
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native'

import { colors } from '../constants/colors'
import Button from './Button'

interface NameModalProps {
  visible: boolean
  title: string
  placeholder?: string
  initialValue?: string
  onSubmit: (name: string) => void
  onClose: () => void
}

// Petite fenêtre pour saisir un nom (Alert.prompt n'existe que sur iOS)
const NameModal = ({ visible, title, placeholder, initialValue = '', onSubmit, onClose }: NameModalProps) => {
  const [name, setName] = useState(initialValue)

  useEffect(() => {
    if (visible) setName(initialValue)
  }, [visible, initialValue])

  const submit = () => {
    if (!name.trim()) return
    onSubmit(name.trim())
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            autoFocus
            onSubmitEditing={submit}
            returnKeyType="done"
          />
          <View style={styles.actions}>
            <Button title="Annuler" variant="outline" color={colors.textMuted} onPress={onClose} style={styles.action} />
            <Button title="Valider" onPress={submit} disabled={!name.trim()} style={styles.action} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default NameModal

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: 10,
    padding: 12,
    fontSize: 17,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  action: {
    flex: 1,
  },
})
