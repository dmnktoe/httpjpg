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

# a cut-out photo as the subject instead of a model (PNG/WebP with alpha)
pnpm holo:render --name cryo --image cryo-fg.webp --palette water --fx burst

# lettering or a logo: size it in card widths and tilt it
pnpm holo:render --name bliss --image bliss.png --image-width 0.98 --image-rotate -12 --palette fire

# the Pocket look: blurred photo behind, the subject bigger than the card so it
# covers the holo frame, effects shooting along one direction
pnpm holo:render --name cryo-burst --image cryo-fg.webp --bg-image cryo.webp --bg-brightness 0.95 \
  --subject-overflow --image-width 1.12 --palette water --fx burst --fx-angle 35 --fx-spread 24

# cut a subject out of a photo first (rembg) and estimate its depth (Depth Anything), then
# render it in the yellow ex style over its own photo tinted to one colour
python3 tools/blender/cutout.py outlet.jpg --crop 1150,950,2250,2250 --out out/rack
pnpm holo:render --name outlet --image out/rack.png --image-depth out/rack-depth.png \
  --bg-image outlet.jpg --bg-tint "#ffcc1a" --subject-overflow --palette electric --fx burst --fx-angle 150

# your own scene: collections `bg`, `subject`, `fx` + a camera
pnpm holo:render --name steelix --blend ~/cards/steelix.blend
```

`cutout.py` needs `pip install rembg onnxruntime numpy pillow`; both models download on
first use (rembg's into its cache, the depth model into `~/.cache/holo-depth/`).

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
                              (full frame with --subject-overflow; manifest says "foregroundFrame": "overhang")
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
  (wave texture) and bokeh (voronoi); or, with `--bg-image`, a photo that the
  wrapper first cover-fits to the frame, blurs (`--bg-blur`, sigma in px,
  default 16), dims (`--bg-brightness`, default 0.6) and can tint to one
  colour (`--bg-tint "#ffcc1a"`, luminance kept) for the one-colour ex cards. A blurred copy of the
  photo the cut-out came from works best: same light, same colours.
- `subject`: your `--model` (glTF/GLB, FBX, OBJ), centred and scaled to 0.62
  units; or `--image`, a cut-out photo on an emissive plane whose alpha also
  shapes the depth map (add `--image-depth`, a greyscale map with white = far
  such as `cutout.py` writes, and the depth pass offsets the plane per pixel by
  `--image-depth-range` of the near–far span, so the subject gets relief
  instead of reading as cardboard); or a faceted gem in brushed rings as the
  placeholder.
  `--subject-overflow` renders the cut-out on the full overhang frame instead
  of cropping it to the card and grows it (`--image-width` 1.1, models 0.9),
  so it covers the holo frame and sticks out past the edge like Pocket's
  full-art figures. Set the blok's Foreground Framing (or `HoloCard`'s
  `foregroundFrame`) to `overhang` for such a file.
- `fx`: emissive triangular shards, grey debris and crossed-sliver sparkles at
  `z = 0.2 … 1.2`, i.e. in front of the subject. They fly along one direction
  (`--fx-angle` in degrees, random per seed by default, counter-clockwise from
  +X) within a cone of `--fx-spread` (default 28°), with a few pieces going the
  opposite way, so the burst reads as motion instead of confetti.
- key, rim (palette accent) and fill area lights, dark world

Palettes: `psychic` (Mew), `fire` (Team Rocket), `steel` (Steelix), `water`,
`grass`, `dark`, `electric` (Zapdos ex: yellow, violet-white lightning),
`scherox`. Add one in `PALETTES` in `render_card.py`.
`--variants N` cycles through the chosen palettes with `--seed + i`.

Effect styles (`--fx`): `shards` (default) scatters small emissive triangles,
debris and sparkles like the Mew card; `burst` shoots big flat orange / blue
wedges, glass crystals and thin beams out of the centre over a backdrop of
radial rays, like Mega-Scherox. Pair `burst` with the `scherox` palette.

## Your own scene

Name three collections `bg`, `subject` and `fx` and keep a camera in the
scene; render resolution and overscan come from the flags. The depth pass
remaps the camera distance between the nearest and farthest bounding-box
corner of `bg` + `subject`, so put nothing in `bg` that is closer than the
subject. Palettes and variants do not apply to your own materials.

## Pipeline notes

- Layers are isolated by toggling `Collection.hide_render`; no view-layer
  juggling, no compositor. For the depth pass every material is swapped for
  one that emits `View Z Depth` through a Map Range (cut-out planes keep their
  alpha), rendered as 16-bit greyscale, then restored.
- Colour management is `Standard`: the holo shader adds the look, the render
  stays neutral.
- `render-card.mjs` crops with `sharp` (from the portfolio app). Without it the
  PNGs are left as rendered.
