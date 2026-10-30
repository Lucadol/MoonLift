import { Modal, Text, View } from 'react-native'

import { makeStyles, useTheme } from '../theme/ThemeContext'
import { NewRecord, formatRecordValue } from '../utils/records'
import Button from './Button'
import Mascot from './mascot/Mascot'

interface NewRecordModalProps {
  record: NewRecord | null
  onSave: () => void
  onClose: () => void
}

const NewRecordModal = ({ record, onSave, onClose }: NewRecordModalProps) => {
  const theme = useTheme()
  const styles = useStyles()
  return (
    <Modal visible={record !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        {record && (
          <View style={styles.modal}>
            <Mascot pose="trophy" size={150} backdrop />
            <Text style={styles.eyebrow}>Nouveau record !</Text>
            <Text style={styles.title}>{record.movement}</Text>
            <Text style={styles.value}>{formatRecordValue(record)}</Text>
            <Text style={styles.previous}>
              Ancien record : {formatRecordValue({ value: record.previous, unit: record.unit })}
            </Text>
            <View style={styles.actions}>
              <Button title="Enregistrer le PR" size="lg" color={theme.colors.tertiary} onPress={onSave} />
              <Button title="Plus tard" variant="ghost" color={theme.colors.textMuted} onPress={onClose} />
            </View>
          </View>
        )}
      </View>
    </Modal>
  )
}

export default NewRecordModal

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
    borderRadius: 28,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: colors.tertiary,
    marginTop: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: -0.5,
    color: colors.text,
    marginTop: 4,
    textAlign: 'center',
  },
  value: {
    fontFamily: fonts.display,
    fontSize: 48,
    letterSpacing: -2,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  previous: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
  },
  actions: {
    alignSelf: 'stretch',
    gap: 6,
    marginTop: 20,
  },
}))
