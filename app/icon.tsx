import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: "#d4a944",
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        color: "#17323b",
        fontWeight: 700,
        fontSize: 20,
        fontFamily: "serif",
      }}
    >
      B
    </div>
  );
}
