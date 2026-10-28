import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#E36414",
          borderRadius: "7px",
          color: "#ffffff",
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        DR
      </div>
    ),
    { ...size }
  );
}
