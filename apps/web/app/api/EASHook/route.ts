import crypto from 'crypto';

import { headers } from 'next/headers';
import safeCompare from 'safe-compare';

import { HTTP_STATUS } from '../../../service/httpStatus';

const getSlackMessagePayload = (
  info: EASBuildPayload,
  isErrorBuild: boolean,
): string => {
  return JSON.stringify({
    attachments: [
      {
        blocks: [],
        color: isErrorBuild ? '#a63636' : '#36a64f',
        fields: [
          ...(info.error
            ? [
                {
                  short: false,
                  title: `ErrorCode (${info.error?.errorCode})`,
                  value: info.error?.message,
                },
              ]
            : []),
          {
            short: true,
            title: 'Project',
            value: info.projectName,
          },
          {
            short: true,
            title: 'Status',
            value: info.status,
          },
          {
            short: true,
            title: 'Platform',
            value: info.platform,
          },
          {
            short: true,
            title: 'BuildProfile',
            value: info.metadata.buildProfile,
          },
          {
            short: true,
            title: 'AppVersion',
            value: info.metadata.appVersion,
          },
        ],
        mrkdwn_in: ['text'],
        pretext: 'Expo Application Services',
        title: 'buildDetailPage',
        title_link: info.buildDetailsPageUrl,
      },
    ],
  });
};

export async function POST(request: Request) {
  const body = (await request.json()) as EASBuildPayload;
  const headersList = headers();
  const isErrorBuild = body.status !== 'finished';

  try {
    const expoSignature = headersList.get('expo-signature');

    if (!expoSignature) {
      return new Response(
        JSON.stringify('Expo-signature header is undefined'),
        {
          status: HTTP_STATUS.BAD_REQUEST,
        },
      );
    }

    // eslint-disable-next-line turbo/no-undeclared-env-vars
    const hmac = crypto.createHmac('sha1', process.env.SECRET_WEBHOOK_KEY);
    hmac.update(JSON.stringify(body));
    const hash = `sha1=${hmac.digest('hex')}`;

    if (
      !safeCompare(
        Array.isArray(expoSignature) ? expoSignature[0] : expoSignature,
        hash,
      )
    ) {
      return new Response(JSON.stringify("Signatures didn't match!"), {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      });
    } else {
      await fetch('<YOUR_SLACK_WEBHOOK_URL>', {
        body: getSlackMessagePayload(body, isErrorBuild),
        method: 'POST',
      });

      return new Response(JSON.stringify('UPDATED'), {
        status: HTTP_STATUS.OK,
      });
    }
  } catch (error) {
    console.log('[log on vercel]', error);

    await fetch('<YOUR_SLACK_WEBHOOK_URL>', {
      body: getSlackMessagePayload(body, isErrorBuild),
      method: 'POST',
    });

    return new Response(JSON.stringify('UPDATED'), {
      status: HTTP_STATUS.BAD_REQUEST,
    });
  }
}

export const runtime = 'edge';
