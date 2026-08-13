// The real `next/navigation` reads `process.env` at module scope, which throws in the browser.

let currentPathname = "/";

export function setMockPathname(pathname: string): void {
  currentPathname = pathname;
}

export function usePathname(): string {
  return currentPathname;
}
