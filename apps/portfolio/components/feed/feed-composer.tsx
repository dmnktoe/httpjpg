"use client";

import { Box, Link } from "@httpjpg/ui";
import { useEffect, useState } from "react";

import {
  ComposerApiError,
  type ComposerPost,
  hasSession,
  loadPost,
  signOut,
} from "@/lib/feed/compose/api";

import { ComposerEditor } from "./composer-editor";
import { buttonClass, errorClass, hintClass } from "./composer-styles";
import { FeedSignIn } from "./feed-sign-in";

export interface FeedComposerProps {
  slug?: string;
}

type Session = "checking" | "signed-out" | "signed-in";

type Loaded =
  | { kind: "loading" }
  | { kind: "ready"; post: ComposerPost | undefined }
  | { kind: "missing" }
  | { kind: "failed" };

export function FeedComposer({ slug }: FeedComposerProps) {
  const [session, setSession] = useState<Session>("checking");
  const [loaded, setLoaded] = useState<Loaded>(
    slug ? { kind: "loading" } : { kind: "ready", post: undefined },
  );

  useEffect(() => {
    let isCurrent = true;
    hasSession()
      .catch(() => false)
      .then((isSignedIn) => {
        if (isCurrent) {
          setSession(isSignedIn ? "signed-in" : "signed-out");
        }
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (session !== "signed-in" || !slug) {
      return;
    }
    let isCurrent = true;
    loadPost(slug)
      .then((post) => {
        if (isCurrent) {
          setLoaded({ kind: "ready", post });
        }
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return;
        }
        const status = error instanceof ComposerApiError ? error.status : 0;
        if (status === 401) {
          setSession("signed-out");
          return;
        }
        setLoaded({ kind: status === 404 ? "missing" : "failed" });
      });
    return () => {
      isCurrent = false;
    };
  }, [session, slug]);

  const handleSignOut = async () => {
    await signOut().catch(() => undefined);
    setSession("signed-out");
  };

  return (
    <Box css={{ display: "flex", flexDirection: "column", gap: "6" }}>
      <Box
        css={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "3",
          fontFamily: "mono",
          fontSize: "sm",
        }}
      >
        <Link href="/feed" css={{ textDecoration: "none" }}>
          [ ← feed ]
        </Link>
        {session === "signed-in" && (
          <button type="button" className={buttonClass} onClick={handleSignOut}>
            [ sign out ]
          </button>
        )}
      </Box>
      {session === "checking" && <p className={hintClass}>one moment ･ﾟ⋆</p>}
      {session === "signed-out" && <FeedSignIn onSignedIn={() => setSession("signed-in")} />}
      {session === "signed-in" && loaded.kind === "loading" && (
        <p className={hintClass}>loading the post ･ﾟ⋆</p>
      )}
      {session === "signed-in" && loaded.kind === "missing" && (
        <p role="alert" className={errorClass}>
          that post does not exist (any more)
        </p>
      )}
      {session === "signed-in" && loaded.kind === "failed" && (
        <p role="alert" className={errorClass}>
          the post could not be loaded — try again in a moment
        </p>
      )}
      {session === "signed-in" && loaded.kind === "ready" && (
        <ComposerEditor key={loaded.post?.slug ?? "new"} post={loaded.post} />
      )}
    </Box>
  );
}
