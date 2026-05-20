"use client";

import { CustomCursor, MouseTrail } from "@httpjpg/ui";

export interface CustomCursorWrapperProps {
  cursorEnabled: boolean;
  trailEnabled: boolean;
}

export function CustomCursorWrapper({ cursorEnabled, trailEnabled }: CustomCursorWrapperProps) {
  return (
    <>
      {cursorEnabled && <CustomCursor size={18} symbol="✧" />}
      {trailEnabled && (
        <MouseTrail character="✧" count={20} lifetime={800} size="16px" color="black" />
      )}
    </>
  );
}
