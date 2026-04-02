import { ImageResponse } from "next/og";

export const alt = "FCLab — 통계로 증명하는 플레이 분석";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0f1117",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,214,143,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,214,143,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Top glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,214,143,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Falling code columns */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "space-between",
            padding: "0 60px",
            opacity: 0.12,
          }}
        >
          {["wilson\nCI\n95%\nσ\nμ", "fetch()\nasync\nawait\nreturn\nconst", "z-score\np<0.05\nH0\nχ²\ndf=14", "map()\nfilter()\nreduce()\n{}\n[]", "0.321\n0.584\n±1.96\nR²\nΔ"].map(
            (col, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  fontSize: 13,
                  color: "#00D68F",
                  whiteSpace: "pre",
                  lineHeight: 1.8,
                }}
              >
                {col}
              </div>
            )
          )}
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            zIndex: 1,
            gap: 20,
          }}
        >
          {/* Logo text */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: "#00D68F",
              letterSpacing: "-2px",
              textShadow: "0 0 60px rgba(0,214,143,0.4), 0 0 120px rgba(0,214,143,0.15)",
            }}
          >
            FCLab
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.6)",
              display: "flex",
              gap: 8,
            }}
          >
            <span style={{ color: "rgba(0,214,143,0.6)" }}>#</span>
            AI 추측이 아닌, 통계적 근거로 증명하는 플레이 분석
          </div>

          {/* Terminal box */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 20,
              border: "1px solid rgba(0,214,143,0.25)",
              borderRadius: 8,
              width: 680,
              background: "rgba(15,17,23,0.9)",
            }}
          >
            {/* Title bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "10px 16px",
                borderBottom: "1px solid rgba(0,214,143,0.1)",
              }}
            >
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,95,87,0.6)" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,189,46,0.6)" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(39,201,63,0.6)" }} />
              <span style={{ marginLeft: 8, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                fclab@terminal
              </span>
            </div>
            {/* Lines */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: "14px 16px",
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "rgba(0,214,143,0.4)" }}>$</span>
                <span style={{ color: "rgba(255,255,255,0.85)" }}>fclab analyze --nick player123</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "#00D68F" }}>✓</span>
                <span style={{ color: "#00D68F" }}>win_rate: 62.0% ci_95: [48.1%, 74.4%]</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "#00D68F" }}>✓</span>
                <span style={{ color: "#00D68F" }}>play_style: BUILDUP (score: 78/100)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 40px",
            fontSize: 12,
            color: "rgba(0,214,143,0.3)",
            borderTop: "1px solid rgba(0,214,143,0.08)",
          }}
        >
          <span>SYS.status: ONLINE</span>
          <span>wilson_score · percentile · z-score · action_rules</span>
          <span>api.ping: 12ms</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
