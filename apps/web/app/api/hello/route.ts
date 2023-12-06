import { HTTP_STATUS } from '../../../service/httpStatus';

/**
 * @swagger
 * paths:
 *  /api/hello:
 *    get:
 *      tags:
 *        - sample
 *      summary: greeting
 *      description: >
 *        say hello
 *      responses:
 *        200:
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                  createdAt:
 *                    type: string
 *                required:
 *                  - message
 *                  - createdAt
 */
export async function GET() {
  return new Response(
    JSON.stringify({ createdAt: Date(), message: 'Hello Bandi!' }),
    {
      status: HTTP_STATUS.OK,
    },
  );
}

export const runtime = 'edge';
