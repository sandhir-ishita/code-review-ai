import { Component } from "react";
import { trackError } from "../services/telemetry";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    trackError(error, { source: "ErrorBoundary" });
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-center">
          <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-400">
              An unexpected error occurred and has been logged. Please reload the page.
            </p>
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Reload App
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
