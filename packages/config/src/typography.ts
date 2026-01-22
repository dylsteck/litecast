// Font families
export const fontFamily = {
  sans: ['-apple-system', 'SF Pro Text', 'system-ui', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
  mono: ['SF Mono', 'Monaco', 'Menlo', 'Consolas', 'monospace'],
};

// Font sizes (in pixels)
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

// Line heights
export const lineHeight = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

// Font weights
export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

// Text styles
export const textStyles = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 1.2,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 1.2,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 1.3,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 1.3,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 1.4,
  },
  body: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 1.5,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 1.4,
  },
  subheadline: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 1.4,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 1.4,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 1.4,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 1.3,
  },
} as const;
