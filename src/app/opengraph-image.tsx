import { ImageResponse } from "next/og";

export const alt = "Haven — a quiet place to pause";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #e7ded0 0%, #f8f4ed 48%, #b5c1b6 100%)",
          color: "#263128",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: "64px",
          width: "100%",
        }}
      >
        <div style={{ fontSize: 84, fontWeight: 500, letterSpacing: "-0.05em" }}>Haven</div>
        <div style={{ fontSize: 28, marginTop: 42, opacity: 0.72 }}>
          A quiet place to emotionally escape reality for a little while.
        </div>
      </div>
    ),
    size,
  );
}
