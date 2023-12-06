'use client';

import type { ComponentProps } from "react";
import "client-only";
import { Button as TamaguiButton } from "tamagui";


export function Button({children, ...props}: ComponentProps<typeof TamaguiButton>) {
  return <TamaguiButton {...props}>{children}</TamaguiButton>;
}
