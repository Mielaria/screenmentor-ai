import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Algo salió mal
          </h1>
          <p className="text-muted-foreground text-sm mb-4">
            Ocurrió un error inesperado. Intenta recargar la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all"
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
