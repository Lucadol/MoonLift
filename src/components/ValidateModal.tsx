import { useEffect, useState } from 'react'
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native'

import { colors } from '../constants/colors'
import Button from './Button'

interface ValidateModalProps {
  visible: boolean
  exerciseName: string
  onValidate: (result: string) => void
  onClose: () => void
}

// Validation manuelle d'un exercice (sans timer) avec un résultat optionnel
const ValidateModal = ({ visible, exerciseName, onValidate, onClose }: ValidateModalProps) => {
  const [result, setResult] = useState('')

  useEffect(() => {
    if (visible) setResult('')
  }, [visible])

  const submit = () => {
    onValidate(result)
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>Valider « {exerciseName} »</Text>
          <Text style={styles.label}>Résultat / score (optionnel)</Text>
          <TextInput
            style={styles.input}
            value={result}
            onChangeText={setResult}
            placeholder="ex : 5x5 @ 100 kg"
            placeholderTextColor={colors.textMuted}
            autoFocus
            onSubmitEditing={submit}
            returnKeyType="done"
          />
          <View style={styles.actions}>
            <Button title="Annuler" variant="outline" color={colors.textMuted} onPress={onClose} style={styles.action} />
            <Button title="✓ Valider" color={colors.green} onPress={submit} style={styles.action} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default ValidateModal

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
  label: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
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
