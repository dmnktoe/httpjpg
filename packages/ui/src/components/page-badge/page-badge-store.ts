/** Page data for the layout draft host. */
export interface PageBadgeSlot {
  href?: string;
  editHref?: string | null;
  accentColor?: string | null;
}

const emptySlot: PageBadgeSlot = {};
let slot: PageBadgeSlot = emptySlot;
let hostCount = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribePageBadge(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPageBadgeSlot(): PageBadgeSlot {
  return slot;
}

export function getPageBadgeHosted(): boolean {
  return hostCount > 0;
}

export function setPageBadgeSlot(next: PageBadgeSlot) {
  slot = next;
  emit();
}

export function registerPageBadgeHost() {
  hostCount += 1;
  emit();
  return () => {
    hostCount = Math.max(0, hostCount - 1);
    emit();
  };
}

export function resetPageBadgeStore() {
  slot = emptySlot;
  hostCount = 0;
  emit();
}
