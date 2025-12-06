#!/usr/bin/env node
/**
 * Spotify Authorization Script
 * Run this once to get your refresh token
 *
 * Usage:
 * 1. Set environment variables:
 *    SPOTIFY_CLIENT_ID=your_client_id
 *    SPOTIFY_CLIENT_SECRET=your_client_secret
 * 2. Run: node scripts/get-spotify-token.js
 * 3. Follow the authorization URL
 * 4. Copy the refresh token to your .env file
 */

const readline = require("node:readline");

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = "https://example.com/callback";
const SCOPES = "user-read-currently-playing user-read-playback-state";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET");
  console.error(
    "\nPlease set them in your environment:\nexport SPOTIFY_CLIENT_ID=xxx\nexport SPOTIFY_CLIENT_SECRET=xxx",
  );
  process.exit(1);
}

const authUrl = `https://accounts.spotify.com/authorize?${new URLSearchParams({
  client_id: CLIENT_ID,
  response_type: "code",
  redirect_uri: REDIRECT_URI,
  scope: SCOPES,
})}`;

console.log("\n🎵 Spotify Authorization\n");
console.log("1. Open this URL in your browser:\n");
console.log(authUrl);
console.log("\n2. Authorize the app");
console.log(
  "3. You'll get an error page - copy the 'code' parameter from the URL",
);
console.log("   Example: https://example.com/callback?code=ABC123...");
console.log("4. Paste the code here:\n");

// Read code from stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Authorization Code: ", async (code) => {
  rl.close();

  if (!code) {
    console.error("❌ No code provided");
    process.exit(1);
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: REDIRECT_URI,
        }),
      },
    );

    const data = await tokenResponse.json();

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    console.log("\n✅ Success! Add this to your .env file:\n");
    console.log(`SPOTIFY_CLIENT_ID=${CLIENT_ID}`);
    console.log(`SPOTIFY_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`SPOTIFY_REFRESH_TOKEN=${data.refresh_token}`);
    console.log("\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
});
