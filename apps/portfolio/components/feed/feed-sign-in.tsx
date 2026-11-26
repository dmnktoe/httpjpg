"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@httpjpg/ui";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ComposerApiError, signIn } from "@/lib/feed/compose/api";

import { buttonClass, errorClass, fieldClass, hintClass, labelClass } from "./composer-styles";

export interface FeedSignInProps {
  onSignedIn: () => void;
}

const schema = z.object({
  token: z.string().trim().min(32, "the publish token has at least 32 characters"),
});

type SignInValues = z.infer<typeof schema>;

export function FeedSignIn({ onSignedIn }: FeedSignInProps) {
  const [failure, setFailure] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(schema), defaultValues: { token: "" } });

  const handleSignIn = handleSubmit(async ({ token }) => {
    setFailure(null);
    try {
      await signIn(token);
      onSignedIn();
    } catch (error) {
      setFailure(signInFailure(error instanceof ComposerApiError ? error.status : 0));
    }
  });

  return (
    <Box
      as="form"
      onSubmit={handleSignIn}
      css={{ display: "flex", flexDirection: "column", gap: "3", maxW: "30rem" }}
    >
      <label className={labelClass}>
        publish token
        <input
          type="password"
          autoComplete="current-password"
          className={fieldClass}
          aria-invalid={Boolean(errors.token)}
          {...register("token")}
        />
      </label>
      {errors.token && (
        <p role="alert" className={errorClass}>
          {errors.token.message}
        </p>
      )}
      {failure && (
        <p role="alert" className={errorClass}>
          {failure}
        </p>
      )}
      <p className={hintClass}>
        the same token the app asks for. this browser keeps a session cookie for 30 days.
      </p>
      <Box>
        <button type="submit" className={buttonClass} disabled={isSubmitting}>
          {isSubmitting ? "[ … ]" : "[ sign in ]"}
        </button>
      </Box>
    </Box>
  );
}

function signInFailure(status: number): string {
  if (status === 401) {
    return "that token does not open the feed";
  }
  if (status === 429) {
    return "too many tries — wait a minute";
  }
  if (status === 503) {
    return "publishing is not set up on this site";
  }
  return "the site did not answer — try again";
}
