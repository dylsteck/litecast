'use client';

import 'client-only';
import { Variable } from '@tamagui/web';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { map } from 'lodash';
import React, { Fragment } from 'react';
import { getTokens, getVariable } from 'tamagui';

import { WindowingProps } from './shared';

export function Windowing<T>(props: WindowingProps<T>) {
  const rowVirtualizer = useWindowVirtualizer({
    ...props.web,
    paddingStart: (getTokens({ prefixed: true }).size['$4.5'] as Variable).val,
  });

  return map(rowVirtualizer.getVirtualItems(), virtualRow => {
    const isLastItem = virtualRow.index === props.web.count - 1;

    if (!props.data) {
      return null;
    }

    return (
      <Fragment key={virtualRow.index}>
        {props.web.renderItem({
          ...virtualRow,
          ...(props.data && { item: props.data[virtualRow.index] }),
          isLastItem,
        })}
        {isLastItem && (
          <div
            // fixme
            // The reason placeholder implemented manually is that 'paddingEnd' option wouldn't work as i expected
            // https://tanstack.com/virtual/v3/docs/api/virtualizer#paddingend
            key={virtualRow.index + 1}
            style={{
              height: getVariable(
                getTokens({ prefixed: true }).size['$5'] as Variable,
              ),
              left: 0,
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualRow.end}px)`,
              width: '100%',
            }}
          />
        )}
      </Fragment>
    );
  });
}
