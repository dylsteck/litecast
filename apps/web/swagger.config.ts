import { createSwaggerSpec } from 'next-swagger-doc';

export const swaggerConfig = {
  apiFolder: 'app/api',
  definition: {
    info: {
      description: '[openapi.json](/api/swagger)',
      title: `Bandi Swagger`,
      version: '0.1.0',
    },
    openapi: '3.0.0',
  },
  schemaFolders: [],
} as Parameters<typeof createSwaggerSpec>[0];
