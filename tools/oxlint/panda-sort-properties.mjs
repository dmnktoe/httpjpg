/**
 * Oxlint JS plugin: sort Panda CSS style properties.
 *
 * Sorts the keys of Panda style objects (`css()`, `cva()`, the `css={{ … }}` JSX
 * prop, and pattern functions like `stack`/`flex`) into a fixed, group-based
 * order — Layout → Box model → Flex/Grid → Sizing → Spacing → Color/Typography →
 * Background → Border → Effects → Transform/Transition → Interactivity.
 *
 * The order is hardcoded (see `PROPERTY_ORDER`) rather than derived from the
 * Panda config, so the plugin has zero runtime dependencies and stays in the ox
 * toolchain. Shorthands are listed immediately before their longhands so the
 * autofix never changes the resolved cascade. Nested objects (conditions like
 * `_hover`, responsive keys like `md`, raw selectors) sort to the end and are
 * recursed into.
 *
 * Autofixable. Bails safely (no reorder) on spreads, computed keys, and objects
 * containing comments, so it never drops or detaches source.
 */

/**
 * Property groups in cascade-safe order. Shorthands come before their longhands.
 * Duplicates across groups are ignored (first occurrence wins).
 * @type {string[]}
 */
const PROPERTY_ORDER = [
  // Positioning
  "position",
  "inset",
  "insetInline",
  "insetBlock",
  "insetInlineStart",
  "insetInlineEnd",
  "top",
  "right",
  "bottom",
  "left",
  "float",
  "clear",
  "zIndex",
  "z",

  // Display / box
  "boxSizing",
  "display",
  "visibility",
  "content",

  // Flex
  "flex",
  "flexBasis",
  "flexDirection",
  "flexFlow",
  "flexGrow",
  "flexShrink",
  "flexWrap",
  "order",
  // Grid
  "grid",
  "gridArea",
  "gridTemplate",
  "gridTemplateAreas",
  "gridTemplateColumns",
  "gridTemplateRows",
  "gridColumn",
  "gridColumnStart",
  "gridColumnEnd",
  "gridRow",
  "gridRowStart",
  "gridRowEnd",
  "gridAutoColumns",
  "gridAutoRows",
  "gridAutoFlow",
  // Alignment + gap (flex & grid)
  "placeContent",
  "placeItems",
  "placeSelf",
  "justifyContent",
  "justifyItems",
  "justifySelf",
  "alignContent",
  "alignItems",
  "alignSelf",
  "gap",
  "gapX",
  "gapY",
  "rowGap",
  "columnGap",

  // Sizing
  "boxSize",
  "aspectRatio",
  "w",
  "width",
  "minW",
  "minWidth",
  "maxW",
  "maxWidth",
  "h",
  "height",
  "minH",
  "minHeight",
  "maxH",
  "maxHeight",

  // Margin
  "m",
  "margin",
  "mx",
  "marginInline",
  "my",
  "marginBlock",
  "mt",
  "marginTop",
  "mr",
  "marginRight",
  "mb",
  "marginBottom",
  "ml",
  "marginLeft",
  "marginInlineStart",
  "marginInlineEnd",
  "marginBlockStart",
  "marginBlockEnd",
  // Padding
  "p",
  "padding",
  "px",
  "paddingInline",
  "py",
  "paddingBlock",
  "pt",
  "paddingTop",
  "pr",
  "paddingRight",
  "pb",
  "paddingBottom",
  "pl",
  "paddingLeft",
  "paddingInlineStart",
  "paddingInlineEnd",
  "paddingBlockStart",
  "paddingBlockEnd",

  // Color
  "color",
  "textColor",
  "opacity",

  // Typography
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "fontVariant",
  "fontFeatureSettings",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "textTransform",
  "textDecoration",
  "textDecorationColor",
  "textDecorationStyle",
  "textDecorationThickness",
  "textOverflow",
  "textWrap",
  "textIndent",
  "verticalAlign",
  "whiteSpace",
  "wordBreak",
  "wordWrap",
  "overflowWrap",
  "writingMode",

  // Background
  "bg",
  "background",
  "bgColor",
  "backgroundColor",
  "bgGradient",
  "backgroundGradient",
  "gradientFrom",
  "gradientVia",
  "gradientTo",
  "bgImage",
  "backgroundImage",
  "bgSize",
  "backgroundSize",
  "bgPosition",
  "backgroundPosition",
  "bgRepeat",
  "backgroundRepeat",
  "bgAttachment",
  "backgroundAttachment",
  "bgClip",
  "backgroundClip",
  "bgOrigin",
  "backgroundOrigin",
  "bgBlendMode",
  "backgroundBlendMode",

  // Border
  "border",
  "borderColor",
  "borderStyle",
  "borderWidth",
  "borderTop",
  "borderTopColor",
  "borderTopStyle",
  "borderTopWidth",
  "borderRight",
  "borderRightColor",
  "borderRightStyle",
  "borderRightWidth",
  "borderBottom",
  "borderBottomColor",
  "borderBottomStyle",
  "borderBottomWidth",
  "borderLeft",
  "borderLeftColor",
  "borderLeftStyle",
  "borderLeftWidth",
  "borderInline",
  "borderInlineColor",
  "borderInlineStyle",
  "borderInlineWidth",
  "borderInlineStart",
  "borderInlineEnd",
  "borderBlock",
  "borderBlockColor",
  "borderBlockStyle",
  "borderBlockWidth",
  "borderBlockStart",
  "borderBlockEnd",
  "borderRadius",
  "rounded",
  "borderTopLeftRadius",
  "roundedTopLeft",
  "borderTopRightRadius",
  "roundedTopRight",
  "borderBottomLeftRadius",
  "roundedBottomLeft",
  "borderBottomRightRadius",
  "roundedBottomRight",
  "borderTopRadius",
  "borderRightRadius",
  "borderBottomRadius",
  "borderLeftRadius",
  "outline",
  "outlineColor",
  "outlineStyle",
  "outlineWidth",
  "outlineOffset",

  // Effects
  "boxShadow",
  "shadow",
  "shadowColor",
  "mixBlendMode",
  "filter",
  "backdropFilter",
  "backdropBlur",

  // Tables / lists
  "tableLayout",
  "borderCollapse",
  "borderSpacing",
  "captionSide",
  "listStyle",
  "listStyleType",
  "listStylePosition",
  "listStyleImage",

  // Transform
  "transform",
  "transformOrigin",
  "transformStyle",
  "translate",
  "translateX",
  "translateY",
  "scale",
  "scaleX",
  "scaleY",
  "rotate",
  "skewX",
  "skewY",
  "perspective",
  "perspectiveOrigin",

  // Transition / animation
  "transition",
  "transitionProperty",
  "transitionDuration",
  "transitionTimingFunction",
  "transitionDelay",
  "willChange",
  "animation",
  "animationName",
  "animationDuration",
  "animationTimingFunction",
  "animationDelay",
  "animationIterationCount",
  "animationDirection",
  "animationFillMode",
  "animationPlayState",

  // Interactivity / scroll / overflow
  "appearance",
  "cursor",
  "pointerEvents",
  "userSelect",
  "resize",
  "touchAction",
  "caretColor",
  "accentColor",
  "scrollBehavior",
  "scrollMargin",
  "scrollPadding",
  "scrollSnapType",
  "scrollSnapAlign",
  "scrollSnapStop",
  "overflow",
  "overflowX",
  "overflowY",
  "overscrollBehavior",
  "overscrollBehaviorX",
  "overscrollBehaviorY",
  "objectFit",
  "objectPosition",
];

/** property name → priority index (lower sorts first) */
const ORDER_INDEX = new Map();
for (let i = 0; i < PROPERTY_ORDER.length; i++) {
  const name = PROPERTY_ORDER[i];
  if (!ORDER_INDEX.has(name)) ORDER_INDEX.set(name, i);
}

/** Functions whose object argument is a Panda style object. */
const STYLE_FUNCTIONS = new Set([
  "css",
  "cva",
  "sva",
  "cx",
  // pattern functions
  "stack",
  "hstack",
  "vstack",
  "flex",
  "grid",
  "gridItem",
  "wrap",
  "aspectRatio",
  "box",
  "center",
  "circle",
  "square",
  "container",
  "divider",
  "float",
  "bleed",
  "spacer",
  "linkOverlay",
  "visuallyHidden",
  "cq",
]);

const KNOWN_BASE = 0;
const UNKNOWN_BASE = 1_000_000;
const NESTED_BASE = 2_000_000;

/**
 * Resolve a property's static key name, or null if it isn't a plain
 * identifier/string key (computed, spread, methods, etc.).
 * @param {any} prop
 * @returns {string | null}
 */
function staticKeyName(prop) {
  if (prop.type !== "Property" || prop.computed || prop.method || prop.kind !== "init") return null;
  const key = prop.key;
  if (key.type === "Identifier") return key.name;
  if (key.type === "Literal" && typeof key.value === "string") return key.value;
  return null;
}

/**
 * Decide whether an object literal's own keys can be reordered, and if so the
 * sorted property order.
 * @param {any} objNode
 * @returns {{ reorder: boolean, sorted?: any[] }}
 */
function levelReorderInfo(objNode) {
  const props = objNode.properties;
  if (props.length < 2) return { reorder: false };

  for (const prop of props) {
    // Spreads and dynamic keys make reordering unsafe (cascade / semantics).
    if (prop.type !== "Property") return { reorder: false };
    if (staticKeyName(prop) === null) return { reorder: false };
  }

  const ranked = props.map((prop, index) => ({ prop, index, rank: rankOf(prop) }));
  const sorted = ranked.slice().sort((a, b) => a.rank - b.rank || a.index - b.index);
  const reorder = sorted.some((entry, position) => entry.index !== position);
  return { reorder, sorted: sorted.map((entry) => entry.prop) };
}

/**
 * Priority for a single property: known style props by their group index,
 * unknown scalar props next (stable), nested object props last (conditions).
 * @param {any} prop
 * @returns {number}
 */
function rankOf(prop) {
  if (prop.value.type === "ObjectExpression") return NESTED_BASE;
  const name = staticKeyName(prop);
  const index = name === null ? undefined : ORDER_INDEX.get(name);
  return index === undefined ? UNKNOWN_BASE : KNOWN_BASE + index;
}

/**
 * Collect the outermost object literals that need reordering within a style
 * subtree. Rebuilding an outermost node fixes all its descendants, so the
 * returned ranges never overlap.
 * @param {any} objNode
 * @param {boolean} ancestorReordered
 * @param {any[]} out
 */
function collectEmitPoints(objNode, ancestorReordered, out) {
  const info = levelReorderInfo(objNode);
  if (info.reorder && !ancestorReordered) out.push(objNode);

  const nextAncestorReordered = ancestorReordered || info.reorder;
  for (const prop of objNode.properties) {
    if (prop.type === "Property") descendValue(prop.value, nextAncestorReordered, out);
    else if (prop.type === "SpreadElement") descendValue(prop.argument, nextAncestorReordered, out);
  }
}

/** Recurse into object/array values looking for nested style objects. */
function descendValue(value, ancestorReordered, out) {
  if (!value) return;
  if (value.type === "ObjectExpression") collectEmitPoints(value, ancestorReordered, out);
  else if (value.type === "ArrayExpression") {
    for (const element of value.elements) descendValue(element, ancestorReordered, out);
  }
}

/**
 * Serialize an object literal with its keys sorted (recursively). Reuses the
 * original source text for values, so only the property order changes.
 * @param {any} objNode
 * @param {{ getText: (node: any) => string }} source
 * @returns {string}
 */
function rebuild(objNode, source) {
  const props = objNode.properties;
  if (props.length === 0) return "{}";

  const info = levelReorderInfo(objNode);
  const order = info.reorder && info.sorted ? info.sorted : props;
  const parts = order.map((element) => serialize(element, source));
  return `{ ${parts.join(", ")} }`;
}

function serialize(element, source) {
  if (element.type === "SpreadElement") return source.getText(element);
  if (element.shorthand || element.computed || element.method || element.kind !== "init") {
    return source.getText(element);
  }
  return `${source.getText(element.key)}: ${rebuildValue(element.value, source)}`;
}

function rebuildValue(value, source) {
  if (!value) return "";
  if (value.type === "ObjectExpression") return rebuild(value, source);
  if (value.type === "ArrayExpression") {
    const items = value.elements.map((element) => rebuildValue(element, source));
    return `[${items.join(", ")}]`;
  }
  return source.getText(value);
}

/**
 * Process a single style-object root: report once with non-overlapping fixes
 * for every outermost out-of-order object. Bails entirely if the root contains
 * comments, so rebuilding can never drop them.
 * @param {any} rootObj
 * @param {any} context
 */
function processRoot(rootObj, context) {
  const source = context.sourceCode;
  if (source.getCommentsInside(rootObj).length > 0) return;

  const emitPoints = [];
  collectEmitPoints(rootObj, false, emitPoints);
  if (emitPoints.length === 0) return;

  context.report({
    node: rootObj,
    messageId: "unsorted",
    fix(fixer) {
      return emitPoints.map((obj) => fixer.replaceTextRange(obj.range, rebuild(obj, source)));
    },
  });
}

/** @type {import("oxlint/plugins-dev").Rule} */
const sortProperties = {
  meta: {
    type: "suggestion",
    fixable: "code",
    docs: {
      description: "Sort Panda CSS style properties into a fixed group-based order.",
    },
    messages: {
      unsorted: "Panda CSS style properties are not sorted.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== "Identifier" || !STYLE_FUNCTIONS.has(node.callee.name)) return;
        for (const arg of node.arguments) {
          if (arg.type === "ObjectExpression") processRoot(arg, context);
        }
      },
      JSXAttribute(node) {
        if (node.name.type !== "JSXIdentifier" || node.name.name !== "css") return;
        const value = node.value;
        if (
          value &&
          value.type === "JSXExpressionContainer" &&
          value.expression.type === "ObjectExpression"
        ) {
          processRoot(value.expression, context);
        }
      },
    };
  },
};

export default {
  meta: { name: "panda" },
  rules: { "sort-properties": sortProperties },
};
