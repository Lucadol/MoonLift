import { useEffect, useState } from 'react'
import { Modal, Text, TextInput, View } from 'react-native'

import { makeStyles, useTheme } from '../theme/ThemeContext'
import Button from './Button'

interface InputModalProps {
  visible: boolean
  title: string
  label?: string
  placeholder?: string
  initialValue?: string
  submitLabel?: string
  submitColor?: string
  required?: boolean // valeur obligatoire (nom) ou facultative (résultat)
  onSubmit: (value: string) => void
  onClose: () => void
}

// Petite fenêtre de saisie (Alert.prompt n'existe que sur iOS)
const InputModal = ({
  visible,
  title,
  label,
  placeholder,
  initialValue = '',
  submitLabel = 'Valider',
  submitColor,
  required = true,
  onSubmit,
  onClose,
}: InputModalProps) => {
  const theme = useTheme()
  const styles = useStyles()
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    if (visible) setValue(initialValue)
  }, [visible, initialValue])

  const canSubmit = !required || value.trim() !== ''
  const submit = () => {
    if (!canSubmit) return
    onSubmit(value.trim())
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          {label && <Text style={styles.label}>{label}</Text>}
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textMuted}
            autoFocus
            onSubmitEditing={submit}
            returnKeyType="done"
          />
          <View style={styles.actions}>
            <Button title="Annuler" variant="outline" color={theme.colors.textMuted} onPress={onClose} style={styles.action} />
            <Button title={submitLabel} color={submitColor} onPress={submit} disabled={!canSubmit} style={styles.action} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default InputModal

const useStyles = makeStyles(({ colors, fonts, mode }) => ({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: mode === 'light' ? 'rgba(43, 38, 34, 0.35)' : 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 22,
    width: '100%',
    maxWidth: 420,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: -0.4,
    color: colors.text,
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
  },
  input: {
    fontFamily: fonts.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  action: {
    flex: 1,
  },
}))
