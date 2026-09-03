/** Slot pages publish to the layout `EditorChrome` host. Not editor UI itself. */
export interface PreviewBadgeSlot {
  previewHref?: string;
  editHref?: string | null;
  accentColor?: string | null;
}

const emptySlot: PreviewBadgeSlot = {};
let slot: PreviewBadgeSlot = emptySlot;
let hostCount = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribePreviewBadge(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPreviewBadgeSlot(): PreviewBadgeSlot {
  return slot;
}

export function getPreviewBadgeHosted(): boolean {
  return hostCount > 0;
}

export function setPreviewBadgeSlot(next: PreviewBadgeSlot) {
  slot = next;
  emit();
}

export function registerPreviewBadgeHost() {
  hostCount += 1;
  emit();
  return () => {
    hostCount = Math.max(0, hostCount - 1);
    emit();
  };
}

export function resetPreviewBadgeStore() {
  slot = emptySlot;
  hostCount = 0;
  emit();
}
