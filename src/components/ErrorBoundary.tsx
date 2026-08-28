import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error: Error | null;
  info: string;
}

/**
 * A render error used to unmount the whole tree, which showed as a blank page —
 * the least debuggable failure there is, especially on someone else's phone.
 * Now it shows what broke and offers a way out.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, info: '' };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ info: (info.componentStack ?? '').trim().split('\n').slice(0, 6).join('\n') });
    // Keep it in the console too, for anyone with devtools open.
    console.error('AI Skill Simulator crashed:', error, info);
  }

  render() {
    const { error, info } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="crash">
        <div className="crash-card">
          <p className="eyebrow">Something broke</p>
          <h1 className="display">The app hit an error.</h1>
          <p className="lede">
            This is a bug, not something you did. The details below say what happened — sending them
            over is the fastest way to get it fixed.
          </p>
          <pre className="crash-detail">
            {error.name}: {error.message}
            {info ? `\n${info}` : ''}
          </pre>
          <div className="crash-actions">
            <button className="btn btn-primary btn-lg" onClick={() => window.location.reload()}>
              Reload
            </button>
            <button
              className="btn btn-lg"
              onClick={() => {
                try {
                  localStorage.clear();
                } catch {
                  /* storage may be unavailable; reloading is still worth a try */
                }
                window.location.reload();
              }}
            >
              Reset progress and reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}
