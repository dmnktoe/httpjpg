"use client";

/**
 * Client-side wrapper for CustomCursor with MouseTrail (Dense style)
 * Needed because root layout is a server component
 */
export function CustomCursorWrapper() {
  return (
    <>
      {/* <CustomCursor size={18} symbol="✧" />
      <MouseTrail
        character="✧"
        count={20}
        lifetime={800}
        size="16px"
        color="black"
      /> */}
    </>
  );
}
