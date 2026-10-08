import { Component } from "react";
import ErrorState from "../ErrorState/ErrorState";

/**
 * ErrorBoundary — catches render/lifecycle errors anywhere below it and
 * shows a recoverable error screen instead of a blank page. Falls back only
 * when the whole tree fails; individual data-loading failures are handled by
 * their own ErrorState components.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, boundaryKey: 0 };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("AppErrorBoundary:", error, info?.componentStack);
  }

  handleReset = () => {
    this.setState((prev) => ({ error: null, boundaryKey: prev.boundaryKey + 1 }));
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorState
          key={this.state.boundaryKey}
          title="Something went wrong"
          description="An unexpected error occurred while rendering this page."
          detail={this.state.error?.message}
          onRetry={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;