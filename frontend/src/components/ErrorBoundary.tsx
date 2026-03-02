import { Component, type ErrorInfo, type ReactNode } from 'react';
import Button from './ui/Button';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                    <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-red-50 rounded-full">
                                <AlertTriangle className="w-12 h-12 text-red-500" />
                            </div>
                        </div>

                        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
                        <p className="text-gray-500 text-sm mb-6">
                            We encountered an unexpected error. Please try reloading pages.
                        </p>

                        <div className="p-4 bg-gray-50 rounded-lg text-left mb-6 overflow-auto max-h-32">
                            <code className="text-xs text-red-500 font-mono">
                                {this.state.error?.message}
                            </code>
                        </div>

                        <Button
                            onClick={() => window.location.reload()}
                            icon={<RefreshCcw className="w-4 h-4" />}
                            variant="outline"
                            className="w-full"
                        >
                            Reload Application
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
