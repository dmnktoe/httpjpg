/**
 * Oxlint JS plugin: ban hand-written Panda token CSS variables.
 *
 * Production builds run Panda with `hash: true`, which hashes token variable
 * names as well as class names, so `--colors-neutral-200` exists only in dev and
 * ships as something like `--lbfZji`. A literal `var(--colors-neutral-200)`
 * survives into the bundle pointing at nothing, and because an unresolvable
 * `var()` is invalid at computed-value time the whole declaration is thrown
 * away. That is how the media skeleton shipped fully transparent: the element,
 * its z-index and its shimmer were all correct, only the gradient was dropped.
 *
 * Write `{colors.neutral.200}` inside a Panda style value, or
 * `token.var("colors.neutral.200")` when the value has to reach a runtime
 * `style` object or a plain prop default.
 *
 * Not autofixable: which replacement is correct depends on whether the string is
 * statically extracted, and only the author knows that.
 */

/**
 * CSS variable prefixes Panda derives from the token categories declared in
 * `packages/ui/panda.config.ts`. Utility variables such as `--blur` and
 * `--gradient-from` are not hashed, so they are deliberately absent.
 */
const TOKEN_VAR_PATTERN =
  /var\(\s*--(colors|fonts|font-sizes|font-weights|letter-spacings|line-heights|spacing|radii|shadows|opacity|sizes|z-index|durations|easings)-/;

/** @type {import("oxlint/plugins-dev").Rule} */
const noTokenVar = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow hand-written Panda token CSS variables, which are hashed in production.",
    },
    messages: {
      rawTokenVar:
        'Hand-written Panda token variable. Token variables are hashed in production, so this resolves to nothing and the declaration is dropped. Use `{token.path}` in a style value, or `token.var("token.path")` for runtime styles.',
    },
  },
  create(context) {
    function check(node, text) {
      if (typeof text === "string" && TOKEN_VAR_PATTERN.test(text)) {
        context.report({ node, messageId: "rawTokenVar" });
      }
    }
    return {
      Literal(node) {
        check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.cooked ?? node.value.raw);
      },
    };
  },
};

export default {
  meta: { name: "panda-tokens" },
  rules: { "no-token-var": noTokenVar },
};
