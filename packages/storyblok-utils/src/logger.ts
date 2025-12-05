/**
 * Simple logger for development
 * @param object - The object to log
 * @param comment - Optional comment
 */
export function logger(object: unknown, comment?: string): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.log(
    "%c ============== INFO LOG \n",
    "color: #22D3EE",
    `${typeof window !== "undefined" && window?.location.pathname}\n`,
    `=== ${comment ?? ""}\n`,
    object,
  );
}
