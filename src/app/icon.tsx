import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05070a",
          borderRadius: 96,
        }}
      >
        <div
          style={{
            width: 320,
            height: 320,
            borderRadius: 72,
            background: "rgba(63,220,122,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#3fdc7a",
            fontSize: 220,
            fontWeight: 700,
            fontFamily: "sans-serif",
          }}
        >
          F
        </div>
      </div>
    ),
    { ...size },
  );
}
