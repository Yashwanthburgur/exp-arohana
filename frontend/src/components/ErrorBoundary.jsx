import { Component } from 'react'

// ╔══════════════════════════════╗
// ✅ ERROR BOUNDARY
// ╚══════════════════════════════╝
//
// Catches runtime errors in the component tree and shows a recovery UI
// instead of crashing to a blank screen.

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })

    // Log for development diagnostics — not exposed in production UI
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught runtime error:', error, errorInfo)
    }
  }

  handleReload() {
    window.location.reload()
  }

  handleReset() {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <div className="max-w-md rounded-2xl border border-red-800 bg-slate-950 p-8 text-center shadow-2xl">
          <div className="mb-2 text-4xl">⚠️</div>

          <h1 className="mb-2 text-xl font-bold text-red-400">
            Something went wrong
          </h1>

          <p className="mb-6 text-sm text-slate-400">
            An unexpected error occurred in Ārohaṇa-rana.
            Your match state may not be recoverable from this error.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <pre className="mb-6 max-h-32 overflow-auto rounded bg-slate-800 p-3 text-left text-xs text-red-300">
              {this.state.error.toString()}
            </pre>
          )}

          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => this.handleReset()}
              className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-black hover:bg-amber-400"
            >
              Try Recovery
            </button>

            <button
              type="button"
              onClick={this.handleReload}
              className="rounded-lg bg-slate-700 px-5 py-2 text-sm font-bold text-white hover:bg-slate-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
