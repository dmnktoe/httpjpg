/**
 * Spotify OAuth Callback Route
 * Used only during initial authorization to get refresh token
 * This runs during the get-spotify-token.js script
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return new NextResponse(
      `<html><body><h1>❌ Authorization failed: ${error}</h1></body></html>`,
      { headers: { "Content-Type": "text/html" } },
    );
  }

  if (!code) {
    return new NextResponse(
      "<html><body><h1>❌ No authorization code received</h1></body></html>",
      { headers: { "Content-Type": "text/html" } },
    );
  }

  // Display the code so user can manually paste it
  return new NextResponse(
    `<html>
      <head>
        <title>Spotify Authorization</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: #1DB954;
            color: white;
          }
          .container {
            text-align: center;
            max-width: 600px;
            padding: 2rem;
          }
          code {
            background: rgba(0,0,0,0.2);
            padding: 1rem;
            border-radius: 8px;
            display: block;
            margin-top: 1rem;
            text-align: left;
            overflow-x: auto;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>✅ Authorization Code</h1>
          <p>Copy this code:</p>
          <code>${code}</code>
          <p style="margin-top: 2rem; opacity: 0.8;">Paste it back in the terminal</p>
        </div>
      </body>
    </html>`,
    { headers: { "Content-Type": "text/html" } },
  );
}
