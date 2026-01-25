import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Keep a console breadcrumb so users can copy/paste.
    // eslint-disable-next-line no-console
    console.error("UI crashed:", error, info);
  }

  resetDemoAndReload = () => {
    try {
      localStorage.removeItem("demo-user");
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const message = this.state.error?.message
      ? String(this.state.error.message)
      : "Unknown error";

    return (
      <div className="min-h-screen w-full bg-[#020617] text-slate-200 flex items-center justify-center p-6">
        <div className="glass w-full max-w-2xl px-8 py-8">
          <h1 className="text-2xl font-semibold text-rose-400">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-300 mt-3 break-words">{message}</p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10"
            >
              Reload
            </button>
            <button
              onClick={this.resetDemoAndReload}
              className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/10"
            >
              Reset demo + reload
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-6">
            Open DevTools Console to see the full stack trace.
          </p>
        </div>
      </div>
    );
  }
}
