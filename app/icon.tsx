import { ImageResponse } from "next/og";

/** Node avoids Edge font-fetch issues; still fast for a single PNG. */
export const runtime = "nodejs";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** TrueType only — @vercel/og rejects WOFF2 (`Unsupported OpenType signature wOF2`). */
const ALLISON_TTF =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/allison/Allison-Regular.ttf";

export default async function Icon() {
  const fontData = await fetch(ALLISON_TTF).then((res) => {
    if (!res.ok) throw new Error("Allison font fetch failed");
    return res.arrayBuffer();
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #050d1f 0%, #0a1628 42%, #1e4db7 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "36px 28px",
            textAlign: "center",
            color: "#ffffff",
            fontFamily: "Allison",
            fontSize: 96,
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: 0,
            textShadow: "0 4px 24px rgba(0,0,0,0.35)",
          }}
        >
          Support Office
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Allison",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
