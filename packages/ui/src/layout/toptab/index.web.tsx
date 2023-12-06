import type { Variable } from '@tamagui/web';
import { isString, map } from 'lodash';
import type { Route } from 'next';
import { useSelectedLayoutSegment } from 'next/navigation';
import React, { ComponentProps } from 'react';
import { Link } from 'solito/link';
import { getTokens, Text, XStack } from 'tamagui';

import { ACTIVE_TINT_COLOR } from '../../config/constant';

interface TopTabProps {
  links: { href: Route; title: string }[];
  _link?: ComponentProps<typeof Link>;
  _text?: ComponentProps<typeof Text>;
}

export function TopTab({ links, _link, _text }: TopTabProps) {
  const lastActiveSegment = useSelectedLayoutSegment() ?? '';

  return (
    <XStack
      // @ts-expect-error Tamagui-unsupported-web-only-type
      position="sticky"
      backgroundColor="$gray1"
      top={(getTokens({ prefixed: true }).size['$4.5'] as Variable).val}
      zIndex={1}
    >
      {map(links, ({ href, title }, index) => {
        const isActivated = getTopTabActiveLinkIndex({
          href,
          index,
          lastActiveSegment,
        });

        return (
          <Link
            key={title}
            href={href}
            viewProps={{
              style: {
                display: 'flex',
                flex: 1,
                flexDirection: 'row',
              },
            }}
            {..._link}
          >
            <Text
              fontFamily="$body"
              textAlign="center"
              fontSize="$3"
              opacity={isActivated ? 1 : 0.4}
              flex={1}
              textTransform="uppercase"
              borderBottomWidth={isActivated ? 2 : 1}
              borderBottomColor={isActivated ? ACTIVE_TINT_COLOR : '$gray5'}
              paddingVertical="$2.5"
              paddingHorizontal="$2"
              {..._text}
            >
              {title}
            </Text>
          </Link>
        );
      })}
    </XStack>
  );
}

function getTopTabActiveLinkIndex({
  lastActiveSegment,
  href,
  index,
}: {
  lastActiveSegment: string;
  href: ComponentProps<typeof Link>['href'];
  index: number;
}) {
  if (lastActiveSegment === '' && index === 0) {
    return true;
  }

  const safeHref = isString(href) ? href : href.pathname ?? '';

  return safeHref.slice(safeHref.lastIndexOf('/') + 1) === lastActiveSegment;
}
