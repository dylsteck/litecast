import { systemColors, darkColors, brandColors, semanticColors } from '../colors';
import { fontFamily, fontSize } from '../typography';

// Tailwind preset that works with both Tailwind CSS and NativeWind
export const litecastPreset = {
  theme: {
    extend: {
      colors: {
        system: {
          label: systemColors.label,
          'secondary-label': systemColors.secondaryLabel,
          'tertiary-label': systemColors.tertiaryLabel,
          separator: systemColors.separator,
          background: systemColors.background,
          'secondary-background': systemColors.secondaryBackground,
          'tertiary-background': systemColors.tertiaryBackground,
          'grouped-background': systemColors.groupedBackground,
          'secondary-grouped-background': systemColors.secondaryGroupedBackground,
        },
        dark: {
          label: darkColors.label,
          'secondary-label': darkColors.secondaryLabel,
          'tertiary-label': darkColors.tertiaryLabel,
          separator: darkColors.separator,
          background: darkColors.background,
          'secondary-background': darkColors.secondaryBackground,
          'tertiary-background': darkColors.tertiaryBackground,
          'grouped-background': darkColors.groupedBackground,
          'secondary-grouped-background': darkColors.secondaryGroupedBackground,
        },
        brand: {
          primary: brandColors.primary,
          'primary-light': brandColors.primaryLight,
          'primary-dark': brandColors.primaryDark,
          accent: brandColors.accent,
        },
        semantic: {
          success: semanticColors.success,
          warning: semanticColors.warning,
          error: semanticColors.error,
          info: semanticColors.info,
        },
      },
      fontFamily: {
        sans: fontFamily.sans,
        mono: fontFamily.mono,
      },
      fontSize: {
        xs: [`${fontSize.xs}px`, { lineHeight: '1.4' }],
        sm: [`${fontSize.sm}px`, { lineHeight: '1.4' }],
        base: [`${fontSize.base}px`, { lineHeight: '1.5' }],
        lg: [`${fontSize.lg}px`, { lineHeight: '1.5' }],
        xl: [`${fontSize.xl}px`, { lineHeight: '1.4' }],
        '2xl': [`${fontSize['2xl']}px`, { lineHeight: '1.3' }],
        '3xl': [`${fontSize['3xl']}px`, { lineHeight: '1.2' }],
        '4xl': [`${fontSize['4xl']}px`, { lineHeight: '1.2' }],
        '5xl': [`${fontSize['5xl']}px`, { lineHeight: '1.1' }],
      },
    },
  },
};

export default litecastPreset;
