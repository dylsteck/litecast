declare module '*.svg' {
  // eslint-disable-next-line import/no-namespace
  import * as React from 'react';
  import type { SvgProps } from 'react-native-svg';

  export type ExtendedSVGProps = SvgProps & {
    // add your additional custom props
  };

  const content: React.FC<ExtendedSVGProps>;
  export default content;
}
