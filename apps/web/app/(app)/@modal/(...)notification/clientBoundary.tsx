'use client';

import 'client-only';
import { useVirtualizer } from '@tanstack/react-virtual';
import { GetApiNotifications200Item } from 'api';
import { map } from 'lodash';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Sheet, Text } from 'tamagui';
import { FixedRow, ESTIMATED_ITEM_SIZE } from 'ui';

interface ClientBoundaryProps {
  data: GetApiNotifications200Item[];
}

export default function ClientBoundary({ data = [] }: ClientBoundaryProps) {
  const [open, setOpen] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);
  const count = data.length;
  const { back } = useRouter();

  const rowVirtualizer = useVirtualizer({
    count,
    estimateSize: () => ESTIMATED_ITEM_SIZE,
    getScrollElement: () => parentRef.current,
  });

  useEffect(function renderSheetAfterSomePortalMountingDuration() {
    setTimeout(() => {
      setOpen(true);
    }, 100);
  }, []);

  return (
    <Sheet
      forceRemoveScrollEnabled={open}
      modal={true}
      open={open}
      onOpenChange={(isOpen: boolean) => {
        if (!isOpen) {
          back();
        }
      }}
      snapPoints={[95, 50, 25]}
      dismissOnSnapToBottom={true}
      dismissOnOverlayPress={false}
      zIndex={100_000}
    >
      <Sheet.Overlay />
      <Sheet.Frame
        display="flex"
        flex={1}
        padding="$4"
        justifyContent={count ? 'center' : 'flex-start'}
        alignItems="center"
        space="$5"
        id="??"
      >
        <Text fontFamily="$body" fontSize="$6">
          Notification
        </Text>
        <div
          ref={parentRef}
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            overflow: 'auto',
            position: 'relative',
            width: '100%',
          }}
        >
          {map(rowVirtualizer.getVirtualItems(), ({ size, start, index }) => (
            <FixedRow
              key={data[index].title}
              item={data[index]}
              isLastItem={count - 1 === index}
              isWeb={true}
              style={{
                height: `${size}px`,
              }}
              y={start}
            />
          ))}
        </div>
      </Sheet.Frame>
    </Sheet>
  );
}
