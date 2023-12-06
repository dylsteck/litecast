import { openBrowserAsync } from 'expo-web-browser';
import React, { ComponentProps } from 'react';
import { Platform } from 'react-native';
import { Link } from 'solito/link';

export function ExternalLink(props: ComponentProps<typeof Link>) {
  return (
    <Link
      target="_blank"
      {...props}
      onClick={e => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          e.preventDefault();
          // Open the link in an in-app browser.
          openBrowserAsync(props.href as string);
        }
      }}
    />
  );
}
