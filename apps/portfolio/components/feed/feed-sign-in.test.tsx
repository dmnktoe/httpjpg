import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

vi.mock("@/lib/feed/compose/api", () => ({ signIn: vi.fn() }));

import { signIn } from "@/lib/feed/compose/api";

import { FeedSignIn } from "./feed-sign-in";

const TOKEN = "a-publish-token-that-is-long-enough-0001";

function submit(token: string) {
  fireEvent.change(screen.getByLabelText("publish token"), { target: { value: token } });
  fireEvent.click(screen.getByRole("button", { name: "[ sign in ]" }));
}

beforeEach(() => {
  vi.mocked(signIn).mockReset().mockResolvedValue(undefined);
});

describe("FeedSignIn", () => {
  it("signs in with the token and reports it", async () => {
    const onSignedIn = vi.fn();
    render(<FeedSignIn onSignedIn={onSignedIn} />);

    submit(` ${TOKEN} `);

    await waitFor(() => expect(onSignedIn).toHaveBeenCalledOnce());
    expect(signIn).toHaveBeenCalledWith(TOKEN);
  });

  it("does not send a token that is too short to be one", async () => {
    render(<FeedSignIn onSignedIn={vi.fn()} />);

    submit("short");

    expect(await screen.findByRole("alert")).toHaveTextContent(/at least 32 characters/);
    expect(signIn).not.toHaveBeenCalled();
  });

  it("says so when the site refuses the token", async () => {
    vi.mocked(signIn).mockRejectedValue(new Error("unauthorized"));
    const onSignedIn = vi.fn();
    render(<FeedSignIn onSignedIn={onSignedIn} />);

    submit(TOKEN);

    expect(await screen.findByRole("alert")).toHaveTextContent(/does not open the feed/);
    expect(onSignedIn).not.toHaveBeenCalled();
  });
});
