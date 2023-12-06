'use client';

import 'client-only';
// eslint-disable-next-line import/named
import SwaggerUI, { SwaggerUIProps } from 'swagger-ui-react';

export default function SwaggerDocument({ spec }: SwaggerUIProps) {
  return <SwaggerUI spec={spec} />;
}
