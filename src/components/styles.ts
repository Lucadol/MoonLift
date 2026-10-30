import { StyleSheet } from 'react-native'
import { colors } from '../constants/colors'

// Styles partagés par les écrans de liste et de formulaire
export const common = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: -12,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '600',
  },
  cardText: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 4,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 30,
    lineHeight: 22,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 10,
    padding: 12,
    fontSize: 17,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  link: {
    color: colors.blue,
    fontSize: 16,
    fontWeight: '600',
  },
  danger: {
    color: colors.red,
    fontSize: 16,
    fontWeight: '600',
  },
})
