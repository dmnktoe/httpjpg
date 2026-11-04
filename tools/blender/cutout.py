"""Cut a subject out of a photo and estimate its depth, ready for `pnpm holo:render --image … --image-depth …`.

    python3 tools/blender/cutout.py photo.jpg --crop 1150,950,2250,2250 --out out/rack

writes `out/rack.png` (RGBA cut-out, rembg + alpha matting) and `out/rack-depth.png`
(greyscale, white = far, Depth Anything V2 small via ONNX Runtime, same size).

Needs `pip install rembg onnxruntime numpy pillow`. Models download on first use:
rembg's into its own cache, the depth model into `~/.cache/holo-depth/`.
"""

from __future__ import annotations

import argparse
import os
import sys
import urllib.request

import numpy as np
from PIL import Image

DEPTH_MODEL_URL = "https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model.onnx"
DEPTH_MODEL_PATH = os.path.expanduser("~/.cache/holo-depth/depth-anything-v2-small.onnx")
DEPTH_INPUT = 518
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("photo")
    parser.add_argument("--out", required=True, help="output path without extension")
    parser.add_argument("--crop", help="left,top,right,bottom in source pixels")
    parser.add_argument("--model", default="isnet-general-use", help="rembg model (isnet-general-use, u2net, birefnet-general, …)")
    parser.add_argument("--no-depth", action="store_true", help="skip the depth map")
    parser.add_argument("--no-matting", action="store_true", help="hard alpha instead of alpha matting")
    return parser.parse_args()


def cut_out(image: Image.Image, model: str, matting: bool) -> Image.Image:
    from rembg import new_session, remove

    session = new_session(model)
    if not matting:
        return remove(image, session=session)
    return remove(
        image,
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=8,
    )


def depth_model_path() -> str:
    if not os.path.exists(DEPTH_MODEL_PATH):
        os.makedirs(os.path.dirname(DEPTH_MODEL_PATH), exist_ok=True)
        print(f"downloading {DEPTH_MODEL_URL}", file=sys.stderr)
        urllib.request.urlretrieve(DEPTH_MODEL_URL, DEPTH_MODEL_PATH)
    return DEPTH_MODEL_PATH


def estimate_depth(photo: Image.Image, alpha: np.ndarray) -> Image.Image:
    """Relative depth of the photo (the model sees the whole crop for context), normalised inside the cut-out."""
    import onnxruntime as ort

    width, height = photo.size
    scale = DEPTH_INPUT / max(width, height)
    input_size = (
        max(14, round(width * scale / 14) * 14),
        max(14, round(height * scale / 14) * 14),
    )
    pixels = np.asarray(photo.resize(input_size, Image.BICUBIC), dtype=np.float32) / 255.0
    pixels = ((pixels - MEAN) / STD).transpose(2, 0, 1)[None].astype(np.float32)
    session = ort.InferenceSession(depth_model_path(), providers=["CPUExecutionProvider"])
    inverse = session.run(None, {"pixel_values": pixels})[0][0]
    inverse = np.asarray(Image.fromarray(inverse).resize((width, height), Image.BICUBIC))
    inside = alpha > 0.5
    values = inverse[inside] if inside.any() else inverse.ravel()
    low, high = np.percentile(values, 2), np.percentile(values, 98)
    # the model predicts inverse depth (bigger = nearer); the card wants white = far
    far = 1.0 - np.clip((inverse - low) / max(high - low, 1e-6), 0.0, 1.0)
    far = np.where(alpha > 0.05, far, 1.0)
    return Image.fromarray((far * 255).astype(np.uint8))


def main() -> None:
    args = parse_args()
    photo = Image.open(args.photo).convert("RGB")
    if args.crop:
        photo = photo.crop(tuple(int(value) for value in args.crop.split(",")))
    cut = cut_out(photo, args.model, not args.no_matting)
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    cut.save(f"{args.out}.png")
    print(f"{args.out}.png {cut.size[0]}x{cut.size[1]} bbox={cut.getbbox()}")
    if args.no_depth:
        return
    alpha = np.asarray(cut.split()[-1], dtype=np.float32) / 255.0
    depth = estimate_depth(photo, alpha)
    depth.save(f"{args.out}-depth.png")
    print(f"{args.out}-depth.png")


if __name__ == "__main__":
    main()
