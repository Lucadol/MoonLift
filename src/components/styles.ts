import { makeStyles } from '../theme/ThemeContext'

// Styles partagés par les écrans de liste et de formulaire
export const useCommonStyles = makeStyles(({ colors, fonts }) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 48,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    letterSpacing: -0.8,
    color: colors.text,
  },
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginTop: 24,
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 18,
    letterSpacing: -0.2,
    color: colors.text,
  },
  cardText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginTop: 3,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    fontFamily: fonts.body,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    marginTop: 14,
  },
  link: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.primary,
  },
  linkMuted: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.textMuted,
  },
  danger: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.danger,
  },
}))
