import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Focus Timer & Time Tracking";
  const subtitle =
    searchParams.get("subtitle") ??
    "Minimal. No gamification. Just pure focus.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#0f0f0f",
          padding: "80px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "-200px",
            right: "-200px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "200px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
            }}
          >
            ⏱
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#ffffff",
              letterSpacing: "-0.5px",
            }}
          >
            FocusSharp
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: "800",
            color: "#ffffff",
            lineHeight: "1.1",
            letterSpacing: "-2px",
            maxWidth: "900px",
            marginBottom: "24px",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "28px",
            color: "#9ca3af",
            maxWidth: "700px",
            lineHeight: "1.4",
            fontWeight: "400",
          }}
        >
          {subtitle}
        </div>

        {/* Bottom pill badges */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "48px",
          }}
        >
          {["Focus Timer", "Pomodoro", "Deep Work", "Flow State"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  padding: "8px 18px",
                  borderRadius: "999px",
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.3)",
                  color: "#a5b4fc",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>

        {/* URL watermark */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            right: "80px",
            fontSize: "20px",
            color: "#4b5563",
            fontWeight: "500",
          }}
        >
          focussharp.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
