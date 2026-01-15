const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const SystemColors = {
  label: '#000000',
  secondaryLabel: '#8E8E93',
  tertiaryLabel: '#C7C7CC',
  separator: 'rgba(60, 60, 67, 0.12)',
  background: '#FFFFFF',
  secondaryBackground: '#F2F2F7',
};

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};
