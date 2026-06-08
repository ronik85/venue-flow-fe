interface Props {
  status: "connecting" | "connected" | "disconnected" | "error";
}

const CONFIG = {
  connected: { label: "Live", color: "var(--success)", pulse: true },
  connecting: { label: "Connecting…", color: "var(--warning)", pulse: true },
  disconnected: { label: "Disconnected", color: "var(--error)", pulse: false },
  error: { label: "Offline", color: "var(--error)", pulse: false },
} as const;

/**
 * Small pill badge that shows the WebSocket connection state.
 * Displayed on the seat-map card so users always know if their view is live.
 */
export default function LiveIndicator({ status }: Props) {
  const { label, color, pulse } = CONFIG[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: "0.7rem",
        fontWeight: 600,
        letterSpacing: "0.05em",
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color,
        userSelect: "none",
      }}
      title={`Real-time connection: ${label}`}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
          animation: pulse ? "live-pulse 1.5s ease-in-out infinite" : "none",
        }}
      />
      {label}

      {/* Inline keyframes — avoids adding a global stylesheet entry */}
      <style>{`
        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
    </span>
  );
}
