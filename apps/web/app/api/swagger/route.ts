import { createSwaggerSpec } from 'next-swagger-doc';

import { HTTP_STATUS } from '../../../service/httpStatus';
import { swaggerConfig } from '../../../swagger.config';

export async function GET() {
  try {
    const swaggerSpec = createSwaggerSpec(swaggerConfig);

    return new Response(JSON.stringify(swaggerSpec), {
      status: HTTP_STATUS.OK,
    });
  } catch (error) {
    return new Response(error as BodyInit, { status: HTTP_STATUS.BAD_REQUEST });
  }
}
