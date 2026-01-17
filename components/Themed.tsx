/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import { Text as DefaultText, useColorScheme, View as DefaultView } from 'react-native';
import { withUniwind } from 'uniwind';

import Colors from '../constants/Colors';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
  className?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

// Wrap with UniWind for className support
const UniwindText = withUniwind(DefaultText);
const UniwindView = withUniwind(DefaultView);

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, className, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <UniwindText className={className} style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, className, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <UniwindView className={className} style={[{ backgroundColor }, style]} {...otherProps} />;
}
