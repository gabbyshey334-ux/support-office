import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

const ALLISON_LATIN_WOFF2 =
  "https://fonts.gstatic.com/s/allison/v13/X7nl4b88AP2nkbvZCCGa4Q.woff2";

export default async function Icon() {
  const fontData = await fetch(ALLISON_LATIN_WOFF2).then((res) => {
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
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 40px",
            textAlign: "center",
            color: "#ffffff",
            fontFamily: "Allison",
            fontSize: 118,
            fontWeight: 400,
            lineHeight: 0.88,
            letterSpacing: "-0.02em",
            textShadow: "0 4px 24px rgba(0,0,0,0.35)",
          }}
        >
          <span>Support</span>
          <span style={{ marginTop: -6 }}>Office</span>
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
