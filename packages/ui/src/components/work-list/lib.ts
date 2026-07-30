const DIVIDER_ATTR = "data-work-divider";

export function applyTagFilter(scope: Element, active: string | null): void {
  const nodes = [...scope.querySelectorAll<HTMLElement>(`[data-tags], [${DIVIDER_ATTR}]`)];
  const isVisible = nodes.map((node) => {
    if (isDivider(node)) {
      return false;
    }
    const tags = (node.dataset.tags || "").split(",").map((tag) => tag.trim());
    return !active || tags.includes(active);
  });

  let previousCardVisible = false;
  const showsDivider = nodes.map((node, index) => {
    if (!isDivider(node)) {
      previousCardVisible = isVisible[index];
      return false;
    }
    return previousCardVisible;
  });

  let laterCardVisible = false;
  for (let index = nodes.length - 1; index >= 0; index--) {
    if (isDivider(nodes[index])) {
      showsDivider[index] = showsDivider[index] && laterCardVisible;
    } else if (isVisible[index]) {
      laterCardVisible = true;
    }
  }

  nodes.forEach((node, index) => {
    const visible = isDivider(node) ? showsDivider[index] : isVisible[index];
    node.style.display = visible ? "" : "none";
  });
}

function isDivider(node: HTMLElement): boolean {
  return node.hasAttribute(DIVIDER_ATTR);
}
