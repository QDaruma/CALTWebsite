import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  message?: string;
}

/**
 * Catches render-time errors so a single failing component shows a friendly
 * recovery screen instead of a blank white page. The builder keeps no critical
 * server state, so "reload" is a safe recovery path.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // No external error tracker (privacy-first); log to the console for local debugging.
    console.error("CALT Task Builder crashed:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        role="alert"
        style={{
          maxWidth: "32rem",
          margin: "6rem auto",
          padding: "0 1.5rem",
          fontFamily: "Inter, system-ui, sans-serif",
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>Something went wrong</h1>
        <p style={{ color: "#6b7488", marginTop: ".5rem" }}>
          The builder hit an unexpected error. Your downloaded projects are
          unaffected. Reloading the page usually fixes it.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "1.25rem",
            padding: ".625rem 1.25rem",
            borderRadius: ".75rem",
            border: "none",
            background: "linear-gradient(to bottom right, #5546e6, #9333ea)",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </div>
    );
  }
}
