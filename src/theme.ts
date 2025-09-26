// src/theme.ts
import { DefaultTheme as NavDefault, Theme as NavTheme } from '@react-navigation/native';
import { MD3DarkTheme as PaperDark, MD3Theme } from 'react-native-paper';

export const colors = {
  bg: '#0b0f1a',        // fundal app (DARK)
  card: '#111827',      // suprafețe (header/tab/card)
  text: '#e5e7eb',
  subtext: '#a7b0c0',
  border: 'rgba(255,255,255,0.06)',
  shadow: 'rgba(0,0,0,0.35)',
  primary: '#3B82F6',
  male: '#3B82F6',      // albastru M
  female: '#EC4899',    // roz F
};

// === React Navigation theme (DARK, fără alb) ===
export const navTheme: NavTheme = {
  ...NavDefault,
  dark: true,
  colors: {
    ...NavDefault.colors,
    primary: colors.primary,
    background: colors.bg,   // 👈 elimină “alb” în spate
    card: colors.card,       // header/tab bar
    text: colors.text,
    border: colors.border,
    notification: colors.female,
  },
};

// === React Native Paper theme (DARK, fără alb) ===
export const paperTheme: MD3Theme = {
  ...PaperDark,
  dark: true,
  colors: {
    ...PaperDark.colors,
    primary: colors.primary,
    background: colors.bg,   // 👈 fundal ecrane
    surface: colors.card,    // carduri/header
    surfaceVariant: colors.card,
    onSurface: colors.text,
    outline: colors.border,
  },
};
