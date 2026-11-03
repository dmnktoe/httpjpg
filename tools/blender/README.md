# Holo card layers from Blender

One scene, one camera, four pixel-aligned files per card: the photo, the subject
cut-out, the effects layer (shards that stick out past the card) and a depth map.
`HoloCard` takes them as `src` / `foregroundSrc` / `effectsSrc` / `depthSrc`, the
`holo_image` blok as Image / Foreground Cut-out / Effects Layer / Depth Map.

```bash
# template scene with your model, six palettes, cropped WebPs copied into public/images/holo/
pnpm holo:render --name gameboy --model ~/models/gameboy.glb --palette all --publish

# three variants of one palette (different seeds), Cycles instead of EEVEE
pnpm holo:render --name mew --model mew.glb --palette psychic --variants 3 --engine cycles --samples 128

# your own scene: collections `bg`, `subject`, `fx` + a camera
pnpm holo:render --name steelix --blend ~/cards/steelix.blend
```

Requires Blender 4.2 or newer on `PATH`, `BLENDER=/path/to/blender`, in the
default install location, or passed as `--blender`. Verified on 5.0.1 headless:
the engine identifier is probed and no compositor is used. EEVEE needs a GL
context; where there is none (containers, CI) the wrapper retries with Cycles
on the CPU, which takes a minute or two per variant.

## What comes out

```
tools/blender/out/<name>[-<palette>-<seed>]/
  <name>.png / .webp          photo   bg + subject, cropped to the card
  <name>-fg.png / .webp       cut-out subject only, alpha, cropped to the card
  <name>-fx.png / .webp       effects fx only, alpha, full frame (card + 18 % per side)
  <name>-depth.png / .webp    depth   greyscale, white = far, cropped to the card
  <name>.json                 manifest (sizes, overscan, depth range, engine)
```

The frame overhang is `--overscan` (default 0.18) and must match `OVERSCAN` in
`packages/ui/src/components/holo-card/holo-card.tsx`; the shader fits the
effects layer to the canvas by aspect, so a different value only shifts where
the shards appear to leave the card.

## Template scene

Without `--blend`, `render_card.py` builds the scene itself:

- orthographic camera, card = 1 unit wide, looking down `-Z`
- `bg`: emissive plane at `z = -1.5` with a palette gradient, light streaks
  (wave texture) and bokeh (voronoi)
- `subject`: your `--model` (glTF/GLB, FBX, OBJ), centred and scaled to 0.62
  units, or a chrome torus placeholder
- `fx`: emissive triangular shards, grey debris and crossed-sliver sparkles,
  scattered across the whole frame at `z = 0.2 … 1.2`, i.e. in front of the subject
- key, rim (palette accent) and fill area lights, dark world

Palettes: `psychic` (Mew), `fire` (Team Rocket), `steel` (Steelix), `water`,
`grass`, `dark`. Add one in `PALETTES` in `render_card.py`. `--variants N`
cycles through the chosen palettes with `--seed + i`.

## Your own scene

Name three collections `bg`, `subject` and `fx` and keep a camera in the
scene; render resolution and overscan come from the flags. The depth pass
remaps the camera distance between the nearest and farthest bounding-box
corner of `bg` + `subject`, so put nothing in `bg` that is closer than the
subject. Palettes and variants do not apply to your own materials.

## Pipeline notes

- Layers are isolated by toggling `Collection.hide_render`; no view-layer
  juggling, no compositor. Depth is a `material_override` that emits
  `View Z Depth` through a Map Range, rendered as 16-bit greyscale.
- Colour management is `Standard`: the holo shader adds the look, the render
  stays neutral.
- `render-card.mjs` crops with `sharp` (from the portfolio app). Without it the
  PNGs are left as rendered.
