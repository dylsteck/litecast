import 'server-only';
import 'swagger-ui-react/swagger-ui.css';
import { Metadata } from 'next';
import { createSwaggerSpec } from 'next-swagger-doc';

import { swaggerConfig } from '../../../swagger.config';

import SwaggerDocument from './swaggerDocument';

export default function Page() {
  const spec = createSwaggerSpec(swaggerConfig);

  return <SwaggerDocument spec={spec} />;
}

export const metadata: Metadata = {
  title: 'Swagger',
};
