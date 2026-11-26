import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

vi.mock("@/lib/feed/compose/api", () => ({
  publishPost: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
}));

vi.mock("@/lib/feed/compose/upload", () => ({
  prepareImage: vi.fn(),
  prepareFile: vi.fn(),
  uploadFile: vi.fn(),
}));

import { type ComposerPost, deletePost, publishPost, updatePost } from "@/lib/feed/compose/api";
import { prepareFile, prepareImage, uploadFile } from "@/lib/feed/compose/upload";

import { ComposerEditor } from "./composer-editor";

const POST: ComposerPost = {
  slug: "abc",
  url: "/feed/abc",
  caption: "harbour",
  date: "2026-11-25 10:00",
  format: "1/1",
  images: [
    { uid: "u1", src: "https://x/a.jpg", fit: "cover", alt: "one" },
    { uid: "u2", src: "https://x/b.jpg", fit: "contain", alt: "two" },
  ],
  music: { source: "soundcloud", src: "https://sc/x", title: "mix", artist: "me" },
};

const probes: Array<{ onload?: () => void; naturalWidth: number; naturalHeight: number }> = [];
let nextUrl = 0;

function file(name: string, type: string): File {
  return new File(["x"], name, { type });
}

function addFiles(...files: File[]) {
  fireEvent.change(screen.getByLabelText("Add pictures or videos"), { target: { files } });
}

function finishProbes() {
  act(() => {
    for (const probe of probes.splice(0)) {
      probe.onload?.();
    }
  });
}

function publishBody(): Record<string, unknown> {
  return vi.mocked(publishPost).mock.calls.at(-1)?.[0] as Record<string, unknown>;
}

beforeEach(() => {
  probes.length = 0;
  nextUrl = 0;
  vi.stubGlobal(
    "Image",
    class {
      naturalWidth = 4000;
      naturalHeight = 2000;
      onload?: () => void;
      set src(_value: string) {
        probes.push(this);
      }
    },
  );
  URL.createObjectURL = vi.fn(() => `blob:${++nextUrl}`);
  URL.revokeObjectURL = vi.fn();
  vi.mocked(publishPost).mockReset().mockResolvedValue({ url: "/feed/new" });
  vi.mocked(updatePost).mockReset().mockResolvedValue({ url: "/feed/abc" });
  vi.mocked(deletePost).mockReset().mockResolvedValue(undefined);
  vi.mocked(prepareImage)
    .mockReset()
    .mockImplementation(async (_file, name) => ({ blob: new Blob(), filename: `${name}.jpg` }));
  vi.mocked(prepareFile)
    .mockReset()
    .mockImplementation((_file, name) => ({ blob: new Blob(), filename: `${name}.mp4` }));
  let assetId = 100;
  vi.mocked(uploadFile)
    .mockReset()
    .mockImplementation(async () => ++assetId);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ComposerEditor, a new post", () => {
  it("uploads the files in order and publishes them with the details", async () => {
    render(<ComposerEditor />);
    addFiles(file("a.jpg", "image/jpeg"), file("clip.mp4", "video/mp4"), file("notes.pdf", ""));
    finishProbes();

    expect(screen.getAllByRole("button", { name: /^File \d/ })).toHaveLength(2);
    fireEvent.change(screen.getByLabelText("alt text"), { target: { value: "harbour" } });
    fireEvent.change(screen.getByLabelText("caption"), { target: { value: "first light" } });
    fireEvent.click(screen.getByRole("button", { name: "[ publish ]" }));

    expect(await screen.findByText(/published/)).toBeInTheDocument();
    expect(prepareImage).toHaveBeenCalledWith(expect.any(File), "post-1", undefined);
    expect(prepareFile).toHaveBeenCalledWith(expect.any(File), "post-2");
    expect(publishBody()).toMatchObject({
      caption: "first light",
      format: "4/5",
      images: [
        { assetId: 101, fit: "cover", alt: "harbour" },
        { assetId: 102, fit: "cover", alt: "" },
      ],
      music: null,
    });
    expect(publishBody().clientId).toMatch(/^[0-9a-f-]{36}$/);
    expect(typeof publishBody().date).toBe("string");
    expect(screen.getByRole("link", { name: "[ open the post ]" })).toHaveAttribute(
      "href",
      "/feed/new",
    );
  });

  it("bakes the crop of a picture that was zoomed", async () => {
    render(<ComposerEditor />);
    addFiles(file("a.jpg", "image/jpeg"));
    finishProbes();

    fireEvent.click(screen.getByRole("button", { name: "[ 1:1 ]" }));
    fireEvent.change(screen.getByLabelText("zoom"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "[ publish ]" }));

    await waitFor(() => expect(prepareImage).toHaveBeenCalled());
    expect(vi.mocked(prepareImage).mock.calls[0]?.[2]).toEqual({
      x: 1500,
      y: 500,
      width: 1000,
      height: 1000,
    });
  });

  it("offers no zoom for a fitted picture or an original frame", () => {
    render(<ComposerEditor />);
    addFiles(file("a.jpg", "image/jpeg"));
    finishProbes();

    expect(screen.getByLabelText("zoom")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "[ fit ]" }));
    expect(screen.queryByLabelText("zoom")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "[ fill ]" }));
    fireEvent.click(screen.getByRole("button", { name: "[ original ]" }));
    expect(screen.queryByLabelText("zoom")).toBeNull();
  });

  it("takes files dropped on the form, and nothing else", () => {
    const { container } = render(<ComposerEditor />);
    const form = container.querySelector("form") as HTMLFormElement;
    const dropped = file("a.jpg", "image/jpeg");

    expect(fireEvent.dragOver(form, { dataTransfer: { types: ["text/plain"], files: [] } })).toBe(
      true,
    );
    fireEvent.drop(form, { dataTransfer: { types: ["text/plain"], files: [] } });
    expect(screen.queryByRole("button", { name: /^File 1/ })).toBeNull();

    expect(fireEvent.dragOver(form, { dataTransfer: { types: ["Files"], files: [dropped] } })).toBe(
      false,
    );
    fireEvent.drop(form, { dataTransfer: { types: ["Files"], files: [dropped] } });
    expect(screen.getByRole("button", { name: "File 1" })).toBeInTheDocument();
  });

  it("refuses to publish nothing", async () => {
    render(<ComposerEditor />);

    fireEvent.click(screen.getByRole("button", { name: "[ publish ]" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/needs a picture, a video or music/);
    expect(publishPost).not.toHaveBeenCalled();
  });

  it("publishes a track from a link, with its details", async () => {
    render(<ComposerEditor />);
    fireEvent.change(screen.getByLabelText("music"), { target: { value: "soundcloud" } });
    fireEvent.change(screen.getByLabelText("link"), { target: { value: "https://sc.test/mix" } });
    fireEvent.change(screen.getByLabelText("title"), { target: { value: " mix " } });
    fireEvent.change(screen.getByLabelText("artist"), { target: { value: "me" } });
    fireEvent.click(screen.getByRole("button", { name: "[ publish ]" }));

    await waitFor(() => expect(publishPost).toHaveBeenCalled());
    expect(publishBody().music).toEqual({
      source: "soundcloud",
      src: "https://sc.test/mix",
      title: "mix",
      artist: "me",
    });
  });

  it("asks for an https link to a streaming track", async () => {
    render(<ComposerEditor />);
    fireEvent.change(screen.getByLabelText("music"), { target: { value: "spotify" } });
    fireEvent.change(screen.getByLabelText("link"), { target: { value: "spotify:track:1" } });
    fireEvent.click(screen.getByRole("button", { name: "[ publish ]" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("an https link");
    expect(publishPost).not.toHaveBeenCalled();
  });

  it("uploads an audio file and its artwork", async () => {
    render(<ComposerEditor />);
    fireEvent.change(screen.getByLabelText("music"), { target: { value: "mp3" } });
    fireEvent.change(screen.getByLabelText("audio file"), {
      target: { files: [file("mix.mp3", "audio/mpeg")] },
    });
    fireEvent.change(screen.getByLabelText("artwork"), {
      target: { files: [file("cover.jpg", "image/jpeg")] },
    });
    fireEvent.click(screen.getByRole("button", { name: "[ publish ]" }));

    await waitFor(() => expect(publishPost).toHaveBeenCalled());
    expect(prepareFile).toHaveBeenCalledWith(expect.any(File), "track");
    expect(prepareImage).toHaveBeenCalledWith(expect.any(File), "artwork");
    expect(publishBody().music).toEqual({ source: "mp3", assetId: 101, artworkAssetId: 102 });
  });

  it("takes a link to an audio file instead, and wants one of the two", async () => {
    render(<ComposerEditor />);
    fireEvent.change(screen.getByLabelText("music"), { target: { value: "mp3" } });
    fireEvent.click(screen.getByRole("button", { name: "[ publish ]" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/audio file or give an https link/);

    fireEvent.change(screen.getByLabelText("or a link to the file"), {
      target: { value: "https://cdn.test/a.mp3" },
    });
    fireEvent.click(screen.getByRole("button", { name: "[ publish ]" }));

    await waitFor(() => expect(publishPost).toHaveBeenCalled());
    expect(publishBody().music).toEqual({ source: "mp3", src: "https://cdn.test/a.mp3" });
  });

  it("says what went wrong and lets the post be sent again", async () => {
    vi.mocked(publishPost).mockRejectedValueOnce(new Error("Storyblok did not accept the post"));
    render(<ComposerEditor />);
    addFiles(file("a.jpg", "image/jpeg"));
    fireEvent.click(screen.getByRole("button", { name: "[ publish ]" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Storyblok did not accept the post");

    fireEvent.click(screen.getByRole("button", { name: "[ publish ]" }));
    expect(await screen.findByText(/published/)).toBeInTheDocument();
  });

  it("has a word for a failure that brings none", async () => {
    vi.mocked(uploadFile).mockRejectedValueOnce("nope");
    render(<ComposerEditor />);
    addFiles(file("a.jpg", "image/jpeg"));
    fireEvent.click(screen.getByRole("button", { name: "[ publish ]" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("something went wrong");
  });

  it("releases its previews when it goes", () => {
    const { unmount } = render(<ComposerEditor />);
    addFiles(file("a.jpg", "image/jpeg"));

    unmount();

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:1");
  });
});

describe("ComposerEditor, an existing post", () => {
  it("starts from the post and saves what changed", async () => {
    render(<ComposerEditor post={POST} />);

    expect(screen.getByLabelText("caption")).toHaveValue("harbour");
    expect(screen.getByLabelText("music")).toHaveValue("keep");
    expect(screen.getByRole("button", { name: "[ 1:1 ]" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Move file 2 earlier" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove file 2" }));
    addFiles(file("c.jpg", "image/jpeg"));
    fireEvent.change(screen.getByLabelText("caption"), { target: { value: "harbour, again" } });
    fireEvent.click(screen.getByRole("button", { name: "[ save ]" }));

    expect(await screen.findByText(/saved/)).toBeInTheDocument();
    const [slug, body] = vi.mocked(updatePost).mock.calls[0] as [string, Record<string, unknown>];
    expect(slug).toBe("abc");
    expect(body).toMatchObject({
      caption: "harbour, again",
      format: "1/1",
      images: [
        { uid: "u2", fit: "contain", alt: "two" },
        { assetId: 101, fit: "cover", alt: "" },
      ],
    });
    expect(body).not.toHaveProperty("music");
    expect(typeof body.date).toBe("string");
    expect(publishPost).not.toHaveBeenCalled();
  });

  it("can drop the music and leave the date alone", async () => {
    render(<ComposerEditor post={{ ...POST, date: "" }} />);

    fireEvent.change(screen.getByLabelText("music"), { target: { value: "none" } });
    fireEvent.click(screen.getByRole("button", { name: "[ save ]" }));

    await waitFor(() => expect(updatePost).toHaveBeenCalled());
    const body = vi.mocked(updatePost).mock.calls[0]?.[1] as Record<string, unknown>;
    expect(body.music).toBeNull();
    expect(body).not.toHaveProperty("date");
  });

  it("keeps a post that is only its music", async () => {
    render(<ComposerEditor post={{ ...POST, images: [] }} />);

    fireEvent.click(screen.getByRole("button", { name: "[ save ]" }));

    expect(await screen.findByText(/saved/)).toBeInTheDocument();
  });

  it("does not take a double click as the confirmation", () => {
    render(<ComposerEditor post={POST} />);

    fireEvent.click(screen.getByRole("button", { name: "[ delete post ]" }), { detail: 1 });
    fireEvent.click(screen.getByRole("button", { name: "[ really delete? ]" }), { detail: 2 });

    expect(deletePost).not.toHaveBeenCalled();
  });

  it("deletes only after being asked twice", async () => {
    render(<ComposerEditor post={POST} />);

    fireEvent.click(screen.getByRole("button", { name: "[ delete post ]" }));
    expect(deletePost).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "[ really delete? ]" }));

    expect(await screen.findByText(/deleted/)).toBeInTheDocument();
    expect(deletePost).toHaveBeenCalledWith("abc");
    expect(screen.queryByRole("link", { name: "[ open the post ]" })).toBeNull();
  });

  it("stays on the post when deleting fails", async () => {
    vi.mocked(deletePost).mockRejectedValue(new Error("Storyblok did not delete the post"));
    render(<ComposerEditor post={POST} />);

    fireEvent.click(screen.getByRole("button", { name: "[ delete post ]" }));
    fireEvent.click(screen.getByRole("button", { name: "[ really delete? ]" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("did not delete");
    expect(screen.getByRole("button", { name: "[ delete post ]" })).toBeInTheDocument();
  });
});
