import { StyleSheet } from 'react-native';
import { colors, spacing, radius, shadows } from './theme';

export const ui = StyleSheet.create({
  // container ecran
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // card / container
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.l,
    ...shadows.card,
  },

  // element listă
  listItem: {
    backgroundColor: colors.surface,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    ...shadows.card,
  },

  // label + input
  label: {
    fontWeight: '600',
    marginTop: spacing.s,
    color: colors.muted,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: spacing.m,
    backgroundColor: colors.surface,
    color: colors.text,
  },

  // chip-uri (sex etc.)
  chipsRow: { flexDirection: 'row', gap: spacing.s },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: spacing.m,
    backgroundColor: colors.surface,
  },
  chipActive: (bg: string) => ({
    backgroundColor: bg,
    borderColor: bg,
  }),
  chipTxt: { color: colors.text },
  chipTxtActive: { color: '#fff', fontWeight: '600' },

  // avatar / imagine
  imageBtn: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
    overflow: 'hidden',
    ...shadows.card,
  },
  image: { width: '100%', height: '100%' },

  // buton principal
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    ...shadows.card,
  },
  buttonPrimaryText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
