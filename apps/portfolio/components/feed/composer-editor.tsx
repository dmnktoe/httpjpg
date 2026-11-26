"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Link } from "@httpjpg/ui";
import { type DragEvent, useEffect, useReducer, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { type ComposerPost, deletePost, publishPost, updatePost } from "@/lib/feed/compose/api";
import { MAX_ZOOM, MIN_ZOOM } from "@/lib/feed/compose/crop";
import { localInputToIso, storyblokToLocalInput } from "@/lib/feed/compose/date";
import {
  bakedRect,
  type ComposerMedia,
  canCrop,
  existingMedia,
  isMediaFile,
  MAX_MEDIA,
  mediaReducer,
  newMedia,
} from "@/lib/feed/compose/media";
import { prepareFile, prepareImage, uploadFile } from "@/lib/feed/compose/upload";

import { ComposerStage } from "./composer-stage";
import { ComposerStrip } from "./composer-strip";
import { buttonClass, errorClass, fieldClass, hintClass, labelClass } from "./composer-styles";

export interface ComposerEditorProps {
  post?: ComposerPost;
}

const FORMATS = [
  { value: "1/1", label: "[ 1:1 ]" },
  { value: "4/5", label: "[ 4:5 ]" },
  { value: "original", label: "[ original ]" },
] as const;

const MUSIC_SOURCES = ["keep", "none", "mp3", "soundcloud", "spotify"] as const;

const schema = z
  .object({
    caption: z.string().max(2200, "at most 2200 characters"),
    date: z.string(),
    musicSource: z.enum(MUSIC_SOURCES),
    musicUrl: z.string().trim(),
    musicTitle: z.string().max(200),
    musicArtist: z.string().max(200),
  })
  .superRefine((values, context) => {
    const needsLink = values.musicSource === "soundcloud" || values.musicSource === "spotify";
    if (needsLink && !/^https:\/\/\S+$/.test(values.musicUrl)) {
      context.addIssue({ code: "custom", path: ["musicUrl"], message: "an https link" });
    }
  });

type EditorValues = z.infer<typeof schema>;

type Outcome =
  | { kind: "idle" }
  | { kind: "working"; step: string }
  | { kind: "failed"; message: string }
  | { kind: "done"; url: string }
  | { kind: "deleted" };

export function ComposerEditor({ post }: ComposerEditorProps) {
  const [media, dispatch] = useReducer(mediaReducer, post?.images.map(existingMedia) ?? []);
  const [selectedKey, setSelectedKey] = useState<string | undefined>(media[0]?.key);
  const [format, setFormat] = useState(post?.format ?? "4/5");
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [outcome, setOutcome] = useState<Outcome>({ kind: "idle" });
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [draft] = useState(() => ({
    clientId: crypto.randomUUID(),
    date: new Date().toISOString(),
  }));
  const urlsRef = useRef<Set<string>>(new Set());
  const counterRef = useRef(0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EditorValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      caption: post?.caption ?? "",
      date: post ? storyblokToLocalInput(post.date) : "",
      musicSource: post?.music ? "keep" : "none",
      musicUrl: "",
      musicTitle: "",
      musicArtist: "",
    },
  });
  const musicSource = useWatch({ control, name: "musicSource" });

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  const selected = media.find((item) => item.key === selectedKey) ?? media[0];
  const isWorking = outcome.kind === "working";

  const addFiles = (files: File[]) => {
    const items: ComposerMedia[] = [];
    for (const file of files.filter(isMediaFile).slice(0, MAX_MEDIA - media.length)) {
      const url = URL.createObjectURL(file);
      urlsRef.current.add(url);
      counterRef.current += 1;
      const item = newMedia(file, `new-${counterRef.current}`, url);
      items.push(item);
      if (item.kind === "image") {
        const probe = new Image();
        probe.onload = () =>
          dispatch({
            type: "update",
            key: item.key,
            patch: { width: probe.naturalWidth, height: probe.naturalHeight },
          });
        probe.src = url;
      }
    }
    if (items.length) {
      dispatch({ type: "add", items });
      setSelectedKey((current) => current ?? items[0]?.key);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes("Files")) {
      event.preventDefault();
      addFiles(Array.from(event.dataTransfer.files));
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes("Files")) {
      event.preventDefault();
    }
  };

  const update = (patch: Partial<ComposerMedia>) => {
    if (selected) {
      dispatch({ type: "update", key: selected.key, patch });
    }
  };

  const handleSave = handleSubmit(async (values) => {
    const music = await buildMusic(values).catch((error: unknown) => error as Error);
    if (music instanceof Error) {
      setOutcome({ kind: "failed", message: music.message });
      return;
    }
    const hasMusic = values.musicSource === "keep" ? Boolean(post?.music) : music.value !== null;
    if (!media.length && !hasMusic) {
      setOutcome({ kind: "failed", message: "a post needs a picture, a video or music" });
      return;
    }
    try {
      const images: Record<string, unknown>[] = [];
      for (const [index, item] of media.entries()) {
        if (item.uid || !item.file) {
          images.push({ uid: item.uid, fit: item.fit, alt: item.alt });
          continue;
        }
        setOutcome({ kind: "working", step: `uploading ${index + 1} / ${media.length}` });
        const name = `post-${index + 1}`;
        const prepared =
          item.kind === "image"
            ? await prepareImage(item.file, name, bakedRect(item, format, media[0]))
            : prepareFile(item.file, name);
        images.push({ assetId: await uploadFile(prepared), fit: item.fit, alt: item.alt });
      }
      setOutcome({ kind: "working", step: post ? "saving" : "publishing" });
      const date = localInputToIso(values.date);
      const body = {
        caption: values.caption,
        format,
        images,
        ...(values.musicSource === "keep" ? {} : { music: music.value }),
      };
      const result = post
        ? await updatePost(post.slug, { ...body, ...(date ? { date } : {}) })
        : await publishPost({
            ...body,
            date: date ?? draft.date,
            clientId: draft.clientId,
          });
      setOutcome({ kind: "done", url: result.url });
    } catch (error) {
      setOutcome({ kind: "failed", message: messageOf(error) });
    }
  });

  const buildMusic = async (
    values: EditorValues,
  ): Promise<{ value: Record<string, unknown> | null }> => {
    if (values.musicSource === "keep" || values.musicSource === "none") {
      return { value: null };
    }
    const details = {
      source: values.musicSource,
      ...(values.musicTitle.trim() ? { title: values.musicTitle.trim() } : {}),
      ...(values.musicArtist.trim() ? { artist: values.musicArtist.trim() } : {}),
    };
    if (values.musicSource !== "mp3") {
      return { value: { ...details, src: values.musicUrl } };
    }
    if (!musicFile && !/^https:\/\/\S+$/.test(values.musicUrl)) {
      throw new Error("pick an audio file or give an https link to one");
    }
    setOutcome({ kind: "working", step: "uploading the track" });
    const track = musicFile
      ? { assetId: await uploadFile(prepareFile(musicFile, "track")) }
      : { src: values.musicUrl };
    const artwork = artworkFile
      ? { artworkAssetId: await uploadFile(await prepareImage(artworkFile, "artwork")) }
      : {};
    return { value: { ...details, ...track, ...artwork } };
  };

  const handleDelete = async () => {
    if (!post) {
      return;
    }
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    setOutcome({ kind: "working", step: "deleting" });
    try {
      await deletePost(post.slug);
      setOutcome({ kind: "deleted" });
    } catch (error) {
      setIsConfirmingDelete(false);
      setOutcome({ kind: "failed", message: messageOf(error) });
    }
  };

  if (outcome.kind === "done" || outcome.kind === "deleted") {
    return (
      <Box css={{ display: "flex", flexDirection: "column", gap: "3", fontFamily: "mono" }}>
        <output>
          {outcome.kind === "deleted"
            ? "deleted ･ﾟ⋆"
            : post
              ? "saved ･ﾟ⋆"
              : "published ･ﾟ⋆ it shows up in the feed within a minute"}
        </output>
        <Box css={{ display: "flex", flexWrap: "wrap", gap: "3" }}>
          {outcome.kind === "done" && <Link href={outcome.url}>[ open the post ]</Link>}
          <Link href="/feed">[ ← feed ]</Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      as="form"
      onSubmit={handleSave}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      css={{
        display: "grid",
        gridTemplateColumns: { base: "minmax(0, 1fr)", md: "minmax(0, 24rem) minmax(0, 1fr)" },
        alignItems: "start",
        gap: { base: "6", md: "10" },
      }}
    >
      <Box css={{ display: "flex", flexDirection: "column", gap: "3", minW: 0 }}>
        <ComposerStage
          media={selected}
          first={media[0]}
          format={format}
          onPan={(offset) => update(offset)}
        />
        <ComposerStrip
          media={media}
          selectedKey={selected?.key}
          onSelect={setSelectedKey}
          onMove={(from, to) => dispatch({ type: "move", from, to })}
          onRemove={(key) => dispatch({ type: "remove", key })}
          onAddFiles={addFiles}
        />
        <p className={hintClass}>
          drop files anywhere · drag a thumbnail to reorder · pictures lose their camera and
          location data on the way up; videos go up as they are, with any location the camera wrote
        </p>
      </Box>

      <Box css={{ display: "flex", flexDirection: "column", gap: "4", minW: 0 }}>
        <Box
          as="fieldset"
          css={{ display: "flex", flexWrap: "wrap", gap: "2", m: 0, p: 0, border: "none" }}
        >
          <legend className={labelClass}>format</legend>
          {FORMATS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={buttonClass}
              aria-pressed={format === option.value}
              onClick={() => setFormat(option.value)}
            >
              {option.label}
            </button>
          ))}
        </Box>

        {selected && (
          <Box
            as="fieldset"
            css={{ display: "flex", flexDirection: "column", gap: "3", m: 0, p: 0, border: "none" }}
          >
            <legend className={labelClass}>this file</legend>
            <Box css={{ display: "flex", flexWrap: "wrap", gap: "2" }}>
              <button
                type="button"
                className={buttonClass}
                aria-pressed={selected.fit === "cover"}
                onClick={() => update({ fit: "cover" })}
              >
                [ fill ]
              </button>
              <button
                type="button"
                className={buttonClass}
                aria-pressed={selected.fit === "contain"}
                onClick={() => update({ fit: "contain", zoom: 1, offsetX: 0, offsetY: 0 })}
              >
                [ fit ]
              </button>
            </Box>
            <p className={hintClass}>
              fill crops to the frame — drag the picture to choose what stays. fit shows the whole
              file with bars.
            </p>
            {canCrop(selected, format) && (
              <label className={labelClass}>
                zoom
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={0.01}
                  value={selected.zoom}
                  onChange={(event) => update({ zoom: Number(event.target.value) })}
                />
              </label>
            )}
            <label className={labelClass}>
              alt text
              <input
                type="text"
                maxLength={200}
                className={fieldClass}
                value={selected.alt}
                onChange={(event) => update({ alt: event.target.value })}
              />
            </label>
          </Box>
        )}

        <label className={labelClass}>
          caption
          <textarea rows={4} className={fieldClass} {...register("caption")} />
        </label>
        {errors.caption && (
          <p role="alert" className={errorClass}>
            {errors.caption.message}
          </p>
        )}

        <label className={labelClass}>
          date
          <input type="datetime-local" className={fieldClass} {...register("date")} />
        </label>
        <p className={hintClass}>{post ? "empty leaves the date as it is." : "empty means now."}</p>

        <label className={labelClass}>
          music
          <select className={fieldClass} {...register("musicSource")}>
            {post?.music && (
              <option value="keep">keep: {post.music.title || post.music.src}</option>
            )}
            <option value="none">none</option>
            <option value="mp3">audio file</option>
            <option value="soundcloud">soundcloud</option>
            <option value="spotify">spotify</option>
          </select>
        </label>
        {musicSource !== "keep" && musicSource !== "none" && (
          <Box css={{ display: "flex", flexDirection: "column", gap: "3" }}>
            {musicSource === "mp3" && (
              <label className={labelClass}>
                audio file
                <input
                  type="file"
                  accept="audio/mpeg,audio/mp4,audio/wav,.mp3,.m4a,.wav"
                  className={fieldClass}
                  onChange={(event) => setMusicFile(event.target.files?.[0] ?? null)}
                />
              </label>
            )}
            <label className={labelClass}>
              {musicSource === "mp3" ? "or a link to the file" : "link"}
              <input type="url" className={fieldClass} {...register("musicUrl")} />
            </label>
            {errors.musicUrl && (
              <p role="alert" className={errorClass}>
                {errors.musicUrl.message}
              </p>
            )}
            <label className={labelClass}>
              title
              <input type="text" className={fieldClass} {...register("musicTitle")} />
            </label>
            <label className={labelClass}>
              artist
              <input type="text" className={fieldClass} {...register("musicArtist")} />
            </label>
            {musicSource === "mp3" && (
              <label className={labelClass}>
                artwork
                <input
                  type="file"
                  accept="image/*"
                  className={fieldClass}
                  onChange={(event) => setArtworkFile(event.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </Box>
        )}

        {outcome.kind === "failed" && (
          <p role="alert" className={errorClass}>
            {outcome.message}
          </p>
        )}
        <Box css={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "3" }}>
          <button type="submit" className={buttonClass} disabled={isWorking}>
            {isWorking ? `[ ${outcome.step} … ]` : post ? "[ save ]" : "[ publish ]"}
          </button>
          {post && (
            <button
              type="button"
              className={buttonClass}
              data-tone="danger"
              disabled={isWorking}
              onClick={handleDelete}
            >
              {isConfirmingDelete ? "[ really delete? ]" : "[ delete post ]"}
            </button>
          )}
        </Box>
        {post && (
          <p className={hintClass}>
            deleting also removes the post's files from storyblok, unless another story uses them.
          </p>
        )}
      </Box>
    </Box>
  );
}

function messageOf(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "something went wrong";
}
