"""Render the layers of a holo card from a Blender scene, headless.

Run through the wrapper (`pnpm holo:render`) or directly:

    blender --background [scene.blend] --python tools/blender/render_card.py -- \
        --out out/mycard --name mycard [--model model.glb] \
        [--palette psychic|fire|steel|water|grass|dark|all] [--variants 3] [--seed 7] \
        [--width 1000] [--height 1400] [--overscan 0.18] [--samples 64] [--engine eevee|cycles]

Scene contract for your own .blend: three collections named `bg`, `subject`
and `fx`, plus a camera. Everything else is ignored. Without a .blend the
script builds the template scene: gradient backdrop with light streaks and
bokeh, a rim-lit subject (your `--model`, or a chrome placeholder), shards,
debris and firework sparkles scattered around it, some beyond the card edge.

All passes share one camera, so the files line up pixel for pixel. The frame
is the card plus `overscan` on every side (the same `OVERSCAN` as HoloCard):

    <name>.png        bg + subject         (the wrapper crops it to the card)
    <name>-fg.png     subject only, alpha  (cropped to the card)
    <name>-fx.png     fx only, alpha       (kept at the full frame)
    <name>-depth.png  16-bit grey, white = far, same frame as the photo (cropped)
    <name>.json       manifest

No compositor is used: layers are toggled with `hide_render`, depth comes from
a material override, so the script runs on Blender 4.2 through 5.x.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import random
import sys

import bpy
from mathutils import Vector

LAYERS = ("bg", "subject", "fx")

# Palettes: hex stops for the backdrop gradient (top → bottom), a streak
# colour, a rim-light accent, shard colours and the sparkle colour.
PALETTES = {
    "psychic": {
        "bg": ("#1a0b3a", "#5a1f8c", "#c23a9a", "#ff8fd0"),
        "streak": "#ff9ae6",
        "accent": "#9b6bff",
        "shards": ("#ff6ad5", "#8c7bff", "#ffffff"),
        "sparkle": "#fff2ff",
    },
    "fire": {
        "bg": ("#2a0808", "#8a1c10", "#e0501c", "#ffb347"),
        "streak": "#ffd36b",
        "accent": "#ff5a2a",
        "shards": ("#ffb347", "#ff5a2a", "#ffffff"),
        "sparkle": "#fff5d6",
    },
    "steel": {
        "bg": ("#1b2014", "#6e7a2a", "#d9c93a", "#f6f2c4"),
        "streak": "#e6ff7a",
        "accent": "#9ec8ff",
        "shards": ("#2f5bff", "#7cff3a", "#d9d9e0"),
        "sparkle": "#ffffff",
    },
    "water": {
        "bg": ("#06143a", "#0a3f8c", "#1fa3d6", "#9be8ff"),
        "streak": "#b3f0ff",
        "accent": "#4dd2ff",
        "shards": ("#4dd2ff", "#ffffff", "#9be8ff"),
        "sparkle": "#f0fbff",
    },
    "grass": {
        "bg": ("#06200f", "#1f6b2a", "#6fc63a", "#dfff9a"),
        "streak": "#eaff9c",
        "accent": "#8cff5a",
        "shards": ("#8cff5a", "#ffe66b", "#ffffff"),
        "sparkle": "#f6fff0",
    },
    "dark": {
        "bg": ("#050507", "#1a1028", "#3a1f5c", "#7a3fa8"),
        "streak": "#b48cff",
        "accent": "#ff4fd8",
        "shards": ("#b48cff", "#ff4fd8", "#ffffff"),
        "sparkle": "#ffffff",
    },
    # Mega-Scherox: black with green rays, orange / blue wedges, violet crystals
    "scherox": {
        "bg": ("#050506", "#10141a", "#1f262e", "#3b454f"),
        "streak": "#39ff8a",
        "accent": "#ff5a1a",
        "shards": ("#ff6a1a", "#1c5cff", "#e8d9ff"),
        "wedges": ("#ff6a1a", "#1c5cff"),
        "beams": ("#ff2d2d", "#ff9a1a", "#39ff8a"),
        "crystal": "#cdb4ff",
        "sparkle": "#ffffff",
    },
}


# --------------------------------------------------------------------------- args


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(prog="render_card.py", description=__doc__)
    parser.add_argument("--out", required=True, help="output directory (one sub-folder per variant)")
    parser.add_argument("--name", default="card", help="base file name")
    parser.add_argument("--model", help="glTF/GLB, FBX or OBJ to use as the subject (template scene only)")
    parser.add_argument("--image", help="cut-out photo (PNG/WebP with alpha) to use as a flat subject instead of a model")
    parser.add_argument("--palette", default="psychic", help="palette name or `all`")
    parser.add_argument("--variants", type=int, default=1, help="how many variants to render")
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument("--width", type=int, default=1000, help="card width in px")
    parser.add_argument("--height", type=int, default=1400, help="card height in px")
    parser.add_argument("--overscan", type=float, default=0.18, help="frame overhang per side, fraction of the card")
    parser.add_argument("--samples", type=int, default=64)
    parser.add_argument("--engine", choices=("eevee", "cycles"), default="eevee")
    parser.add_argument("--shards", type=int, default=20, help="scatter density; burst uses about a third of it per element")
    parser.add_argument("--sparkles", type=int, default=10)
    parser.add_argument(
        "--fx",
        choices=("shards", "burst"),
        default="shards",
        help="shards: small emissive triangles (Mew); burst: big flat wedges, glass crystals and beams from the centre (Scherox)",
    )
    return parser.parse_args(argv)


def script_args() -> list[str]:
    if "--" in sys.argv:
        return sys.argv[sys.argv.index("--") + 1 :]
    return []


# --------------------------------------------------------------------------- helpers


def hex_to_rgb(value: str) -> tuple[float, float, float, float]:
    value = value.lstrip("#")
    r, g, b = (int(value[i : i + 2], 16) / 255.0 for i in (0, 2, 4))
    # sRGB → linear, since node colours are linear
    def lin(c: float) -> float:
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    return (lin(r), lin(g), lin(b), 1.0)


def pick_engine(preferred: str) -> str:
    """EEVEE's identifier changed twice; probe the enum instead of guessing."""
    if preferred == "cycles":
        return "CYCLES"
    items = {item.identifier for item in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items}
    for candidate in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
        if candidate in items:
            return candidate
    return "CYCLES"


def log(message: str) -> None:
    print(f"[holo] {message}", flush=True)


def get_collection(name: str) -> bpy.types.Collection:
    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(collection)
    return collection


def clear_collection(collection: bpy.types.Collection) -> None:
    for obj in list(collection.objects):
        bpy.data.objects.remove(obj, do_unlink=True)


def link_to(obj: bpy.types.Object, collection: bpy.types.Collection) -> None:
    for other in list(obj.users_collection):
        other.objects.unlink(obj)
    collection.objects.link(obj)


def new_material(name: str) -> tuple[bpy.types.Material, bpy.types.NodeTree]:
    material = bpy.data.materials.new(name)
    if bpy.app.version < (5, 0, 0):
        # 5.0 materials always use nodes; the flag is deprecated there
        material.use_nodes = True
    tree = material.node_tree
    tree.nodes.clear()
    return material, tree


def emission_material(name: str, color: str, strength: float) -> bpy.types.Material:
    material, tree = new_material(name)
    emission = tree.nodes.new("ShaderNodeEmission")
    emission.inputs["Color"].default_value = hex_to_rgb(color)
    emission.inputs["Strength"].default_value = strength
    output = tree.nodes.new("ShaderNodeOutputMaterial")
    tree.links.new(emission.outputs["Emission"], output.inputs["Surface"])
    return material


def glass_material(name: str, color: str) -> bpy.types.Material:
    material, tree = new_material(name)
    bsdf = tree.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = hex_to_rgb(color)
    bsdf.inputs["Roughness"].default_value = 0.08
    bsdf.inputs["IOR"].default_value = 1.5
    bsdf.inputs["Transmission Weight"].default_value = 1.0
    bsdf.inputs["Emission Color"].default_value = hex_to_rgb(color)
    bsdf.inputs["Emission Strength"].default_value = 0.6
    output = tree.nodes.new("ShaderNodeOutputMaterial")
    tree.links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return material


def fade_emission_material(name: str, color: str, strength: float, axis: str, extent: float) -> bpy.types.Material:
    """Emission that is white-hot in the core and fades to a translucent tint toward the tips."""
    material, tree = new_material(name)
    coords = tree.nodes.new("ShaderNodeTexCoord")
    split = tree.nodes.new("ShaderNodeSeparateXYZ")
    absolute = tree.nodes.new("ShaderNodeMath")
    absolute.operation = "ABSOLUTE"
    remap = tree.nodes.new("ShaderNodeMapRange")
    remap.inputs["From Min"].default_value = 0.0
    remap.inputs["From Max"].default_value = extent
    remap.clamp = True
    tint = tree.nodes.new("ShaderNodeValToRGB")
    tint.color_ramp.elements[0].position = 0.0
    tint.color_ramp.elements[0].color = (1.0, 1.0, 1.0, 1.0)
    tint.color_ramp.elements[1].position = 0.14
    tint.color_ramp.elements[1].color = hex_to_rgb(color)
    alpha = tree.nodes.new("ShaderNodeValToRGB")
    alpha.color_ramp.elements[0].position = 0.35
    alpha.color_ramp.elements[0].color = (1.0, 1.0, 1.0, 1.0)
    alpha.color_ramp.elements[1].position = 1.0
    alpha.color_ramp.elements[1].color = (0.18, 0.18, 0.18, 1.0)
    emission = tree.nodes.new("ShaderNodeEmission")
    emission.inputs["Strength"].default_value = strength
    transparent = tree.nodes.new("ShaderNodeBsdfTransparent")
    mix = tree.nodes.new("ShaderNodeMixShader")
    output = tree.nodes.new("ShaderNodeOutputMaterial")
    links = tree.links
    links.new(coords.outputs["Object"], split.inputs["Vector"])
    links.new(split.outputs[axis], absolute.inputs[0])
    links.new(absolute.outputs["Value"], remap.inputs["Value"])
    links.new(remap.outputs["Result"], tint.inputs["Fac"])
    links.new(remap.outputs["Result"], alpha.inputs["Fac"])
    links.new(tint.outputs["Color"], emission.inputs["Color"])
    links.new(alpha.outputs["Color"], mix.inputs["Fac"])
    links.new(transparent.outputs["BSDF"], mix.inputs[1])
    links.new(emission.outputs["Emission"], mix.inputs[2])
    links.new(mix.outputs["Shader"], output.inputs["Surface"])
    return material


def image_plane_material(name: str, image: bpy.types.Image) -> bpy.types.Material:
    """A cut-out photo: its own colours as emission, its alpha as transparency."""
    material, tree = new_material(name)
    texture = tree.nodes.new("ShaderNodeTexImage")
    texture.image = image
    texture.interpolation = "Cubic"
    emission = tree.nodes.new("ShaderNodeEmission")
    emission.inputs["Strength"].default_value = 1.0
    transparent = tree.nodes.new("ShaderNodeBsdfTransparent")
    mix = tree.nodes.new("ShaderNodeMixShader")
    output = tree.nodes.new("ShaderNodeOutputMaterial")
    tree.links.new(texture.outputs["Color"], emission.inputs["Color"])
    tree.links.new(texture.outputs["Alpha"], mix.inputs["Fac"])
    tree.links.new(transparent.outputs["BSDF"], mix.inputs[1])
    tree.links.new(emission.outputs["Emission"], mix.inputs[2])
    tree.links.new(mix.outputs["Shader"], output.inputs["Surface"])
    return material


def anisotropic_material(name: str, color: str) -> bpy.types.Material:
    """Brushed metal: tight anisotropic highlight, reads as machined rather than plastic."""
    material, tree = new_material(name)
    bsdf = tree.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = hex_to_rgb(color)
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = 0.22
    bsdf.inputs["Anisotropic"].default_value = 0.85
    bsdf.inputs["Anisotropic Rotation"].default_value = 0.25
    bsdf.inputs["Coat Weight"].default_value = 0.4
    output = tree.nodes.new("ShaderNodeOutputMaterial")
    tree.links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return material


def gem_material(name: str, color: str) -> bpy.types.Material:
    material, tree = new_material(name)
    bsdf = tree.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = hex_to_rgb(color)
    bsdf.inputs["Roughness"].default_value = 0.02
    bsdf.inputs["IOR"].default_value = 2.3
    bsdf.inputs["Transmission Weight"].default_value = 1.0
    bsdf.inputs["Coat Weight"].default_value = 1.0
    bsdf.inputs["Emission Color"].default_value = hex_to_rgb(color)
    bsdf.inputs["Emission Strength"].default_value = 0.35
    output = tree.nodes.new("ShaderNodeOutputMaterial")
    tree.links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return material


def metal_material(name: str, color: str, roughness: float) -> bpy.types.Material:
    material, tree = new_material(name)
    bsdf = tree.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = hex_to_rgb(color)
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = roughness
    output = tree.nodes.new("ShaderNodeOutputMaterial")
    tree.links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    return material


# --------------------------------------------------------------------------- template scene


def frame_size_units(args: argparse.Namespace) -> tuple[float, float]:
    """The card is 1 unit wide; the frame adds the overscan on every side."""
    grow = 1.0 + 2.0 * args.overscan
    return grow, grow * (args.height / args.width)


def build_camera(args: argparse.Namespace) -> bpy.types.Object:
    frame_w, _ = frame_size_units(args)
    data = bpy.data.cameras.new("HoloCamera")
    data.type = "ORTHO"
    data.sensor_fit = "HORIZONTAL"
    data.ortho_scale = frame_w
    data.clip_start = 0.1
    data.clip_end = 50.0
    camera = bpy.data.objects.new("HoloCamera", data)
    camera.location = (0.0, 0.0, 6.0)
    camera.rotation_euler = (0.0, 0.0, 0.0)
    bpy.context.scene.collection.objects.link(camera)
    bpy.context.scene.camera = camera
    return camera


def build_backdrop(palette: dict, rng: random.Random, rays: bool = False) -> None:
    bg = get_collection("bg")
    clear_collection(bg)
    bpy.ops.mesh.primitive_plane_add(size=4.0, location=(0.0, 0.0, -1.5))
    plane = bpy.context.active_object
    plane.name = "HoloBackdrop"
    link_to(plane, bg)

    material, tree = new_material("HoloBackdrop")
    coords = tree.nodes.new("ShaderNodeTexCoord")
    mapping = tree.nodes.new("ShaderNodeMapping")
    mapping.inputs["Rotation"].default_value = (0.0, 0.0, math.radians(90.0))
    gradient = tree.nodes.new("ShaderNodeTexGradient")
    gradient.gradient_type = "LINEAR"
    ramp = tree.nodes.new("ShaderNodeValToRGB")
    stops = palette["bg"]
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = hex_to_rgb(stops[0])
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color = hex_to_rgb(stops[-1])
    for index, stop in enumerate(stops[1:-1], start=1):
        element = ramp.color_ramp.elements.new(index / (len(stops) - 1))
        element.color = hex_to_rgb(stop)

    # light streaks: a distorted wave texture, thresholded (or rays from the centre)
    streak_map = tree.nodes.new("ShaderNodeMapping")
    streak_map.inputs["Rotation"].default_value = (0.0, 0.0, math.radians(rng.uniform(20.0, 70.0)))
    streak_map.inputs["Scale"].default_value = (1.0, 1.0, 1.0)
    wave = tree.nodes.new("ShaderNodeTexWave")
    wave.wave_type = "BANDS"
    wave.inputs["Scale"].default_value = rng.uniform(1.2, 2.2)
    wave.inputs["Distortion"].default_value = rng.uniform(3.0, 6.0)
    wave.inputs["Detail"].default_value = 3.0
    wave.inputs["Detail Roughness"].default_value = 0.7
    streak_ramp = tree.nodes.new("ShaderNodeValToRGB")
    streak_ramp.color_ramp.elements[0].position = 0.55
    streak_ramp.color_ramp.elements[0].color = (0.0, 0.0, 0.0, 1.0)
    streak_ramp.color_ramp.elements[1].position = 0.97
    streak_ramp.color_ramp.elements[1].color = hex_to_rgb(palette["streak"])

    # bokeh: voronoi cells, soft and sparse
    voronoi = tree.nodes.new("ShaderNodeTexVoronoi")
    voronoi.inputs["Scale"].default_value = rng.uniform(5.0, 8.0)
    voronoi.inputs["Randomness"].default_value = 1.0
    bokeh_ramp = tree.nodes.new("ShaderNodeValToRGB")
    bokeh_ramp.color_ramp.elements[0].position = 0.0
    bokeh_ramp.color_ramp.elements[0].color = hex_to_rgb(palette["accent"])
    bokeh_ramp.color_ramp.elements[1].position = 0.35
    bokeh_ramp.color_ramp.elements[1].color = (0.0, 0.0, 0.0, 1.0)

    add_streaks = tree.nodes.new("ShaderNodeMix")
    add_streaks.data_type = "RGBA"
    add_streaks.blend_type = "ADD"
    add_streaks.inputs["Factor"].default_value = 0.55
    add_bokeh = tree.nodes.new("ShaderNodeMix")
    add_bokeh.data_type = "RGBA"
    add_bokeh.blend_type = "ADD"
    add_bokeh.inputs["Factor"].default_value = 0.45
    emission = tree.nodes.new("ShaderNodeEmission")
    emission.inputs["Strength"].default_value = 1.0
    output = tree.nodes.new("ShaderNodeOutputMaterial")

    links = tree.links
    links.new(coords.outputs["Object"], mapping.inputs["Vector"])
    links.new(mapping.outputs["Vector"], gradient.inputs["Vector"])
    links.new(gradient.outputs["Fac"], ramp.inputs["Fac"])
    links.new(coords.outputs["Object"], streak_map.inputs["Vector"])
    if rays:
        # angle around the centre → sine → thin bright rays, like the Scherox backdrop
        radial = tree.nodes.new("ShaderNodeTexGradient")
        radial.gradient_type = "RADIAL"
        scale_angle = tree.nodes.new("ShaderNodeMath")
        scale_angle.operation = "MULTIPLY"
        scale_angle.inputs[1].default_value = rng.uniform(90.0, 130.0)
        sine = tree.nodes.new("ShaderNodeMath")
        sine.operation = "SINE"
        sharpen = tree.nodes.new("ShaderNodeMath")
        sharpen.operation = "POWER"
        sharpen.inputs[1].default_value = 40.0
        links.new(streak_map.outputs["Vector"], radial.inputs["Vector"])
        links.new(radial.outputs["Fac"], scale_angle.inputs[0])
        links.new(scale_angle.outputs["Value"], sine.inputs[0])
        links.new(sine.outputs["Value"], sharpen.inputs[0])
        links.new(sharpen.outputs["Value"], streak_ramp.inputs["Fac"])
        streak_ramp.color_ramp.elements[0].position = 0.3
        streak_ramp.color_ramp.elements[1].position = 1.0
        add_streaks.inputs["Factor"].default_value = 0.38
    else:
        links.new(streak_map.outputs["Vector"], wave.inputs["Vector"])
        links.new(wave.outputs["Fac"], streak_ramp.inputs["Fac"])
    links.new(coords.outputs["Object"], voronoi.inputs["Vector"])
    links.new(voronoi.outputs["Distance"], bokeh_ramp.inputs["Fac"])
    # Mix nodes expose typed sockets as A/B by index: 6 = A (color), 7 = B (color), 2 = result
    links.new(ramp.outputs["Color"], add_streaks.inputs[6])
    links.new(streak_ramp.outputs["Color"], add_streaks.inputs[7])
    links.new(add_streaks.outputs[2], add_bokeh.inputs[6])
    links.new(bokeh_ramp.outputs["Color"], add_bokeh.inputs[7])
    # vignette: darker toward the corners so the subject and the shards pop
    vignette = tree.nodes.new("ShaderNodeTexGradient")
    vignette.gradient_type = "SPHERICAL"
    vignette_map = tree.nodes.new("ShaderNodeMapping")
    vignette_map.inputs["Scale"].default_value = (0.55, 0.55, 1.0)
    vignette_ramp = tree.nodes.new("ShaderNodeValToRGB")
    vignette_ramp.color_ramp.elements[0].position = 0.0
    vignette_ramp.color_ramp.elements[0].color = (0.25, 0.25, 0.3, 1.0)
    vignette_ramp.color_ramp.elements[1].position = 0.75
    vignette_ramp.color_ramp.elements[1].color = (1.0, 1.0, 1.0, 1.0)
    darken = tree.nodes.new("ShaderNodeMix")
    darken.data_type = "RGBA"
    darken.blend_type = "MULTIPLY"
    darken.inputs["Factor"].default_value = 1.0
    links.new(coords.outputs["Object"], vignette_map.inputs["Vector"])
    links.new(vignette_map.outputs["Vector"], vignette.inputs["Vector"])
    links.new(vignette.outputs["Fac"], vignette_ramp.inputs["Fac"])
    links.new(add_bokeh.outputs[2], darken.inputs[6])
    links.new(vignette_ramp.outputs["Color"], darken.inputs[7])
    links.new(darken.outputs[2], emission.inputs["Color"])
    links.new(emission.outputs["Emission"], output.inputs["Surface"])
    plane.data.materials.append(material)


def import_model(path: str) -> list[bpy.types.Object]:
    before = set(bpy.data.objects)
    ext = os.path.splitext(path)[1].lower()
    if ext in (".glb", ".gltf"):
        bpy.ops.import_scene.gltf(filepath=path)
    elif ext == ".fbx":
        bpy.ops.import_scene.fbx(filepath=path)
    elif ext == ".obj":
        bpy.ops.wm.obj_import(filepath=path)
    else:
        raise SystemExit(f"unsupported model format: {ext} (use .glb, .gltf, .fbx or .obj)")
    return [obj for obj in bpy.data.objects if obj not in before]


def fit_subject(objects: list[bpy.types.Object], target_width: float) -> None:
    """Centre the imported objects on the origin and scale them to `target_width` units."""
    bpy.context.view_layer.update()
    corners = [obj.matrix_world @ Vector(corner) for obj in objects if obj.type == "MESH" for corner in obj.bound_box]
    if not corners:
        return
    lo = Vector((min(c.x for c in corners), min(c.y for c in corners), min(c.z for c in corners)))
    hi = Vector((max(c.x for c in corners), max(c.y for c in corners), max(c.z for c in corners)))
    centre = (lo + hi) / 2.0
    size = max(hi.x - lo.x, hi.y - lo.y, 1e-6)
    scale = target_width / size
    parent = bpy.data.objects.new("HoloSubjectRoot", None)
    bpy.context.scene.collection.objects.link(parent)
    for obj in objects:
        if obj.parent is None:
            obj.parent = parent
    parent.location = -centre * scale
    parent.scale = (scale, scale, scale)
    return


def build_subject(args: argparse.Namespace, palette: dict) -> None:
    subject = get_collection("subject")
    clear_collection(subject)
    if args.image:
        path = os.path.abspath(args.image)
        log(f"using cut-out {path} as the subject")
        image = bpy.data.images.load(path)
        image.alpha_mode = "STRAIGHT"
        aspect = image.size[1] / max(image.size[0], 1)
        bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0.0, 0.0, 0.0))
        plane = bpy.context.active_object
        plane.name = "HoloImageSubject"
        width = 0.8
        plane.scale = (width, width * aspect, 1.0)
        plane.data.materials.append(image_plane_material("HoloImageSubject", image))
        plane["holo_alpha_image"] = image.name
        link_to(plane, subject)
        return
    if args.model:
        log(f"importing {args.model}")
        objects = import_model(os.path.abspath(args.model))
        fit_subject(objects, 0.62)
        for obj in objects:
            link_to(obj, subject)
        root = bpy.data.objects.get("HoloSubjectRoot")
        if root is not None:
            link_to(root, subject)
        return
    # placeholder: a faceted gem held by two brushed-metal rings, tilted toward the camera
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.23)
    gem = bpy.context.active_object
    gem.name = "HoloGem"
    gem.rotation_euler = (math.radians(18.0), math.radians(12.0), math.radians(30.0))
    gem.scale = (1.0, 1.0, 1.25)
    gem.data.materials.append(gem_material("HoloGem", palette["accent"]))
    bpy.ops.object.shade_flat()
    link_to(gem, subject)
    for index, (tilt, roll, major) in enumerate(((58.0, -22.0, 0.36), (-40.0, 35.0, 0.42))):
        bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=0.035, major_segments=128, minor_segments=32)
        ring = bpy.context.active_object
        ring.name = f"HoloRing.{index}"
        ring.rotation_euler = (math.radians(tilt), 0.0, math.radians(roll))
        ring.data.materials.append(anisotropic_material(f"HoloRing{index}", "#e9ecf2" if index == 0 else "#c9ccd6"))
        bpy.ops.object.shade_smooth()
        link_to(ring, subject)


def build_lights(palette: dict) -> None:
    scene_collection = bpy.context.scene.collection
    for name, location, energy, color, size in (
        ("HoloKey", (1.6, -1.2, 3.2), 420.0, "#ffffff", 1.6),
        ("HoloRim", (-1.4, 1.6, 1.2), 600.0, palette["accent"], 1.2),
        ("HoloFill", (-1.0, -1.6, 2.2), 120.0, palette["streak"], 2.5),
    ):
        data = bpy.data.lights.new(name, "AREA")
        data.energy = energy
        data.size = size
        data.color = hex_to_rgb(color)[:3]
        light = bpy.data.objects.new(name, data)
        light.location = location
        direction = Vector((0.0, 0.0, 0.0)) - Vector(location)
        light.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        scene_collection.objects.link(light)
    world = bpy.context.scene.world or bpy.data.worlds.new("HoloWorld")
    bpy.context.scene.world = world
    if bpy.app.version < (5, 0, 0):
        world.use_nodes = True
    tree = world.node_tree
    tree.nodes.clear()
    # striped softbox: bright bands in the reflections make metal read as metal
    coords = tree.nodes.new("ShaderNodeTexCoord")
    mapping = tree.nodes.new("ShaderNodeMapping")
    mapping.inputs["Rotation"].default_value = (math.radians(35.0), math.radians(20.0), 0.0)
    bands = tree.nodes.new("ShaderNodeTexWave")
    bands.wave_type = "BANDS"
    bands.inputs["Scale"].default_value = 1.6
    bands.inputs["Distortion"].default_value = 0.0
    ramp = tree.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.72
    ramp.color_ramp.elements[0].color = (0.004, 0.004, 0.006, 1.0)
    ramp.color_ramp.elements[1].position = 0.86
    ramp.color_ramp.elements[1].color = (2.5, 2.5, 2.6, 1.0)
    accent = tree.nodes.new("ShaderNodeMix")
    accent.data_type = "RGBA"
    accent.blend_type = "ADD"
    accent.inputs["Factor"].default_value = 0.12
    accent.inputs[7].default_value = hex_to_rgb(palette["accent"])
    background = tree.nodes.new("ShaderNodeBackground")
    background.inputs["Strength"].default_value = 1.0
    output = tree.nodes.new("ShaderNodeOutputWorld")
    tree.links.new(coords.outputs["Generated"], mapping.inputs["Vector"])
    tree.links.new(mapping.outputs["Vector"], bands.inputs["Vector"])
    tree.links.new(bands.outputs["Fac"], ramp.inputs["Fac"])
    tree.links.new(ramp.outputs["Color"], accent.inputs[6])
    tree.links.new(accent.outputs[2], background.inputs["Color"])
    tree.links.new(background.outputs["Background"], output.inputs["Surface"])


def random_in_frame(rng: random.Random, frame_w: float, frame_h: float, keep_out: float) -> tuple[float, float]:
    """Uniform position inside the frame, outside the subject's keep-out radius."""
    for _ in range(64):
        x = rng.uniform(-frame_w / 2.0, frame_w / 2.0)
        y = rng.uniform(-frame_h / 2.0, frame_h / 2.0)
        if math.hypot(x, y) > keep_out:
            return x, y
    return frame_w / 2.0, 0.0


def build_burst(args: argparse.Namespace, palette: dict, rng: random.Random, fx: bpy.types.Collection) -> None:
    """Scherox style: big flat wedges, glass crystals and thin beams shooting out of the centre."""
    frame_w, frame_h = frame_size_units(args)
    wedge_colors = palette.get("wedges", palette["shards"][:2])
    wedge_materials = [fade_emission_material(f"HoloWedge{i}", color, 1.7, "Y", 0.11) for i, color in enumerate(wedge_colors)]
    beam_materials = [fade_emission_material(f"HoloBeam{i}", color, 7.0, "X", 0.5) for i, color in enumerate(palette.get("beams", palette["shards"]))]
    crystal_material = glass_material("HoloCrystal", palette.get("crystal", "#cdb4ff"))
    reach = math.hypot(frame_w, frame_h) / 2.0

    wedge_count = max(args.shards // 3, 5)
    for index in range(wedge_count):
        # spread the wedges around the ring instead of leaving it to chance
        angle = (index + rng.uniform(0.1, 0.9)) * (2.0 * math.pi / wedge_count)
        length = rng.uniform(0.4, 0.8) * reach
        width = rng.uniform(0.07, 0.16)
        start = rng.uniform(0.3, 0.5)
        cx, cy = math.cos(angle) * (start + length / 2.0), math.sin(angle) * (start + length / 2.0)
        bpy.ops.mesh.primitive_cone_add(vertices=3, radius1=width, radius2=0.0, depth=0.004, location=(cx, cy, rng.uniform(0.5, 1.0)))
        wedge = bpy.context.active_object
        wedge.name = f"HoloWedge.{index:03d}"
        wedge.rotation_euler = (0.0, 0.0, angle + math.pi / 2.0)
        wedge.scale = (1.0, length / width * 0.5, 1.0)
        wedge.data.materials.append(wedge_materials[index % len(wedge_materials)])
        link_to(wedge, fx)

    for index in range(max(args.shards // 2, 6)):
        x, y = random_in_frame(rng, frame_w, frame_h, 0.32)
        size = rng.uniform(0.025, 0.07)
        bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=size, radius2=size * 0.45, depth=size * rng.uniform(2.5, 4.5), location=(x, y, rng.uniform(0.3, 1.2)))
        crystal = bpy.context.active_object
        crystal.name = f"HoloCrystal.{index:03d}"
        crystal.rotation_euler = (rng.uniform(0.0, math.pi), rng.uniform(0.0, math.pi), rng.uniform(0.0, math.pi))
        crystal.data.materials.append(crystal_material)
        bpy.ops.object.shade_smooth()
        link_to(crystal, fx)

    for index in range(max(args.shards // 4, 4)):
        angle = rng.uniform(0.0, 2.0 * math.pi)
        length = rng.uniform(0.3, 0.9) * reach
        start = rng.uniform(0.3, 0.6)
        cx, cy = math.cos(angle) * (start + length / 2.0), math.sin(angle) * (start + length / 2.0)
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cx, cy, rng.uniform(0.4, 0.9)))
        beam = bpy.context.active_object
        beam.name = f"HoloBeam.{index:03d}"
        beam.rotation_euler = (0.0, 0.0, angle)
        beam.scale = (length, rng.uniform(0.003, 0.007), 0.003)
        beam.data.materials.append(rng.choice(beam_materials))
        link_to(beam, fx)


def build_effects(args: argparse.Namespace, palette: dict, rng: random.Random) -> None:
    fx = get_collection("fx")
    clear_collection(fx)
    frame_w, frame_h = frame_size_units(args)
    sparkle_material = emission_material("HoloSparkle", palette["sparkle"], 9.0)
    if args.fx == "burst":
        build_burst(args, palette, rng, fx)
        build_sparkles(args, palette, rng, fx, sparkle_material)
        return
    shard_materials = [fade_emission_material(f"HoloShard{i}", color, 4.5, "Y", 0.12) for i, color in enumerate(palette["shards"])]
    debris_material = anisotropic_material("HoloDebris", "#9a9ca6")

    for index in range(args.shards):
        x, y = random_in_frame(rng, frame_w, frame_h, 0.3)
        size = rng.uniform(0.04, 0.16)
        bpy.ops.mesh.primitive_cone_add(vertices=3, radius1=size, radius2=0.0, depth=size * 0.12, location=(x, y, rng.uniform(0.25, 1.2)))
        shard = bpy.context.active_object
        shard.name = f"HoloShard.{index:03d}"
        shard.rotation_euler = (rng.uniform(0.0, math.pi), rng.uniform(0.0, math.pi), rng.uniform(0.0, math.pi))
        shard.scale = (1.0, rng.uniform(0.35, 1.0), 1.0)
        shard.data.materials.append(rng.choice(shard_materials))
        link_to(shard, fx)

    for index in range(max(args.shards // 2, 6)):
        x, y = random_in_frame(rng, frame_w, frame_h, 0.18)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=rng.uniform(0.008, 0.03), location=(x, y, rng.uniform(0.2, 1.0)))
        rock = bpy.context.active_object
        rock.name = f"HoloDebris.{index:03d}"
        rock.rotation_euler = (rng.uniform(0.0, math.pi), rng.uniform(0.0, math.pi), 0.0)
        rock.data.materials.append(debris_material)
        link_to(rock, fx)
    build_sparkles(args, palette, rng, fx, sparkle_material)


def build_sparkles(args: argparse.Namespace, palette: dict, rng: random.Random, fx: bpy.types.Collection, sparkle_material: bpy.types.Material) -> None:
    """Firework sparkles: two crossed slivers, facing the camera."""
    frame_w, frame_h = frame_size_units(args)
    for index in range(args.sparkles):
        x, y = random_in_frame(rng, frame_w, frame_h, 0.0)
        size = rng.uniform(0.03, 0.1)
        z = rng.uniform(0.3, 1.1)
        for angle in (0.0, math.pi / 2.0):
            bpy.ops.mesh.primitive_plane_add(size=1.0, location=(x, y, z))
            sliver = bpy.context.active_object
            sliver.name = f"HoloSparkle.{index:03d}"
            sliver.scale = (size, size * 0.08, 1.0)
            sliver.rotation_euler = (0.0, 0.0, angle + rng.uniform(-0.2, 0.2))
            sliver.data.materials.append(sparkle_material)
            link_to(sliver, fx)


def build_template(args: argparse.Namespace, palette: dict, rng: random.Random) -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    build_camera(args)
    build_backdrop(palette, rng, rays=args.fx == "burst")
    build_subject(args, palette)
    build_lights(palette)
    build_effects(args, palette, rng)


# --------------------------------------------------------------------------- depth


def depth_material(near: float, far: float) -> bpy.types.Material:
    """Emits the camera distance remapped to 0 (near) … 1 (far)."""
    material, tree = new_material("HoloDepth")
    camera_data = tree.nodes.new("ShaderNodeCameraData")
    remap = tree.nodes.new("ShaderNodeMapRange")
    remap.inputs["From Min"].default_value = near
    remap.inputs["From Max"].default_value = far
    remap.inputs["To Min"].default_value = 0.0
    remap.inputs["To Max"].default_value = 1.0
    remap.clamp = True
    emission = tree.nodes.new("ShaderNodeEmission")
    emission.inputs["Strength"].default_value = 1.0
    output = tree.nodes.new("ShaderNodeOutputMaterial")
    tree.links.new(camera_data.outputs["View Z Depth"], remap.inputs["Value"])
    tree.links.new(remap.outputs["Result"], emission.inputs["Color"])
    tree.links.new(emission.outputs["Emission"], output.inputs["Surface"])
    return material


def depth_alpha_material(near: float, far: float, image: bpy.types.Image) -> bpy.types.Material:
    """Depth for a cut-out plane: transparent where the photo is transparent."""
    material = depth_material(near, far)
    material.name = f"HoloDepthAlpha.{image.name}"
    tree = material.node_tree
    output = next(node for node in tree.nodes if node.type == "OUTPUT_MATERIAL")
    emission = next(node for node in tree.nodes if node.type == "EMISSION")
    texture = tree.nodes.new("ShaderNodeTexImage")
    texture.image = image
    transparent = tree.nodes.new("ShaderNodeBsdfTransparent")
    mix = tree.nodes.new("ShaderNodeMixShader")
    tree.links.new(texture.outputs["Alpha"], mix.inputs["Fac"])
    tree.links.new(transparent.outputs["BSDF"], mix.inputs[1])
    tree.links.new(emission.outputs["Emission"], mix.inputs[2])
    tree.links.new(mix.outputs["Shader"], output.inputs["Surface"])
    return material


def apply_depth_materials(near: float, far: float, collections: list[str]):
    """Swap every mesh material in `collections` for a depth material; returns a restore function."""
    plain = depth_material(near, far)
    saved: list[tuple[bpy.types.Object, list[bpy.types.Material | None]]] = []
    for name in collections:
        collection = bpy.data.collections.get(name)
        if collection is None:
            continue
        for obj in collection.all_objects:
            if obj.type != "MESH":
                continue
            saved.append((obj, [slot.material for slot in obj.material_slots]))
            image_name = obj.get("holo_alpha_image")
            replacement = depth_alpha_material(near, far, bpy.data.images[image_name]) if image_name else plain
            if not obj.material_slots:
                obj.data.materials.append(replacement)
            for slot in obj.material_slots:
                slot.material = replacement

    def restore() -> None:
        for obj, materials in saved:
            for slot, material in zip(obj.material_slots, materials):
                slot.material = material

    return restore


def depth_range(camera: bpy.types.Object, collections: list[str]) -> tuple[float, float]:
    """Nearest and farthest bounding-box corner along the camera's view axis."""
    bpy.context.view_layer.update()
    forward = camera.matrix_world.to_quaternion() @ Vector((0.0, 0.0, -1.0))
    origin = camera.matrix_world.translation
    distances = []
    for name in collections:
        collection = bpy.data.collections.get(name)
        if collection is None:
            continue
        for obj in collection.all_objects:
            if obj.type != "MESH":
                continue
            for corner in obj.bound_box:
                world = obj.matrix_world @ Vector(corner)
                distances.append((world - origin).dot(forward))
    if not distances:
        return 0.1, 10.0
    near, far = min(distances), max(distances)
    pad = (far - near) * 0.02 + 1e-3
    return max(near - pad, 0.001), far + pad


# --------------------------------------------------------------------------- render


def configure_render(args: argparse.Namespace) -> str:
    scene = bpy.context.scene
    grow = 1.0 + 2.0 * args.overscan
    scene.render.resolution_x = round(args.width * grow)
    scene.render.resolution_y = round(args.height * grow)
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.render.image_settings.compression = 50
    scene.render.use_single_layer = True
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    engine = pick_engine(args.engine)
    scene.render.engine = engine
    if engine == "CYCLES":
        scene.cycles.samples = args.samples
        scene.cycles.use_denoising = True
    else:
        scene.eevee.taa_render_samples = args.samples
    return engine


def render_pass(path: str, visible: dict[str, bool], transparent: bool, depth16: bool) -> None:
    scene = bpy.context.scene
    for name in LAYERS:
        collection = bpy.data.collections.get(name)
        if collection is not None:
            collection.hide_render = not visible.get(name, False)
    scene.render.film_transparent = transparent
    settings = scene.render.image_settings
    if depth16:
        settings.color_mode = "BW"
        settings.color_depth = "16"
    else:
        settings.color_mode = "RGBA"
        settings.color_depth = "8"
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def render_variant(args: argparse.Namespace, out_dir: str, palette_name: str, seed: int, engine: str) -> dict:
    os.makedirs(out_dir, exist_ok=True)
    camera = bpy.context.scene.camera
    if camera is None:
        raise SystemExit("the scene has no camera")
    for name in LAYERS:
        if bpy.data.collections.get(name) is None:
            raise SystemExit(f"missing collection `{name}` (expected `bg`, `subject`, `fx`)")
    near, far = depth_range(camera, ["bg", "subject"])
    base = os.path.join(out_dir, args.name)
    passes = (
        (f"{base}.png", {"bg": True, "subject": True}, False),
        (f"{base}-fg.png", {"subject": True}, True),
        (f"{base}-fx.png", {"fx": True}, True),
    )
    for path, visible, transparent in passes:
        log(f"render {os.path.basename(path)}")
        render_pass(path, visible, transparent, False)
    log(f"render {args.name}-depth.png")
    restore = apply_depth_materials(near, far, ["bg", "subject"])
    try:
        render_pass(f"{base}-depth.png", {"bg": True, "subject": True}, False, True)
    finally:
        restore()
    grow = 1.0 + 2.0 * args.overscan
    manifest = {
        "name": args.name,
        "palette": palette_name,
        "fx": args.fx,
        "seed": seed,
        "card": {"width": args.width, "height": args.height},
        "frame": {"width": round(args.width * grow), "height": round(args.height * grow)},
        "overscan": args.overscan,
        "depthRange": {"near": near, "far": far},
        "engine": engine,
        "blender": bpy.app.version_string,
        "files": {
            "photo": f"{args.name}.png",
            "foreground": f"{args.name}-fg.png",
            "effects": f"{args.name}-fx.png",
            "depth": f"{args.name}-depth.png",
        },
    }
    with open(f"{base}.json", "w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2)
    return manifest


def main() -> None:
    args = parse_args(script_args())
    uses_own_scene = bool(bpy.data.filepath)
    if args.palette == "all":
        palettes = list(PALETTES)
    elif args.palette in PALETTES:
        palettes = [args.palette]
    else:
        raise SystemExit(f"unknown palette `{args.palette}`; use one of {', '.join(PALETTES)} or `all`")

    if uses_own_scene:
        variants = [(None, args.seed)]
        log(f"rendering {bpy.data.filepath} (own scene: palettes and variants apply to the template only)")
    else:
        variants = [(palettes[i % len(palettes)], args.seed + i) for i in range(max(args.variants, len(palettes) if args.palette == "all" else 1))]

    manifests = []
    for index, (palette_name, seed) in enumerate(variants):
        if palette_name is not None:
            rng = random.Random(seed)
            log(f"variant {index + 1}/{len(variants)}: palette {palette_name}, seed {seed}")
            build_template(args, PALETTES[palette_name], rng)
        engine = configure_render(args)
        suffix = "" if len(variants) == 1 else f"-{palette_name}-{seed}"
        out_dir = os.path.join(os.path.abspath(args.out), f"{args.name}{suffix}")
        manifests.append(render_variant(args, out_dir, palette_name or "scene", seed, engine))

    index_path = os.path.join(os.path.abspath(args.out), "index.json")
    with open(index_path, "w", encoding="utf-8") as handle:
        json.dump({"variants": manifests}, handle, indent=2)
    log(f"done: {len(manifests)} variant(s) → {os.path.abspath(args.out)}")


if __name__ == "__main__":
    main()
