import { readFileSync } from 'fs';
import { join } from 'path';

import { GetApiPost200Item } from 'api';

import { HTTP_STATUS } from '../../../../service/httpStatus';

/**
 * @swagger
 * paths:
 *  /api/post/{postId}:
 *    get:
 *      tags:
 *        - post
 *      summary: post
 *      description: >
 *        post detail
 *      parameters:
 *        - in: path
 *          name: postId
 *          required: true
 *          schema:
 *            type: string
 *          description: The post id
 *      responses:
 *        200:
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                  description:
 *                    type: string
 *                  img:
 *                    type: string
 *                  meta:
 *                    type: object
 *                    properties:
 *                      createdAt:
 *                        type: string
 *                      location:
 *                        type: string
 *                    required:
 *                      - createdAt
 *                      - location
 *                  title:
 *                    type: string
 *                required:
 *                  - id
 *                  - description
 *                  - img
 *                  - meta
 *                  - title
 */
export async function GET(
  request: Request,
  {
    params,
  }: {
    params: { postId: string };
  },
) {
  const dataDir = join(process.cwd(), '/public/data/posts.json');
  const jsonString = readFileSync(dataDir, 'utf8');
  const { data } = JSON.parse(jsonString) as {
    data: GetApiPost200Item[];
  };

  return new Response(JSON.stringify(data.find(i => i.id === params.postId)), {
    status: HTTP_STATUS.OK,
  });
}
