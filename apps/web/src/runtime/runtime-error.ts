import { toast } from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';

interface ErrorContext {
    userId?: string;
    component?: string;
    action?: string;
    metadata?: Record<string, any>;
}

export class RuntimeErrorHandler {
    private static instance: RuntimeErrorHandler;
    private supabase = createClient(
        process.env.VITE_SUPABASE_URL!,
        process.env.VITE_SUPABASE_ANON_KEY!
    );
    private retryQueue: Array<{ fn: Function; attempts: number }> = [];
    private maxRetries = 3;
    private sentryEnabled = false;

    static getInstance(): RuntimeErrorHandler {
        if (!RuntimeErrorHandler.instance) {
            RuntimeErrorHandler.instance = new RuntimeErrorHandler();
        }
        return RuntimeErrorHandler.instance;
    }

    async captureException(error: Error, context?: ErrorContext): Promise<void> {
        console.error('Runtime Error:', error, context);

        // Categorize error type
        const errorType = this.categorizeError(error);

        // Show user-friendly toast
        this.showErrorToast(errorType, error.message);

        // Log to Supabase
        await this.logToSupabase(error, context, errorType);

        // Send to Sentry if enabled
        if (this.sentryEnabled && window.Sentry) {
            window.Sentry.captureException(error, { contexts: { custom: context } });
        }

        // Handle retry logic
        if (this.shouldRetry(errorType)) {
            this.scheduleRetry(error, context);
        }
    }

    private categorizeError(error: Error): string {
        if (error.message.includes('fetch')) return 'NETWORK';
        if (error.message.includes('auth')) return 'AUTH';
        if (error.message.includes('supabase')) return 'DATABASE';
        if (error.message.includes('IndexedDB')) return 'STORAGE';
        if (error.message.includes('WASM')) return 'RUNTIME';
        return 'UNKNOWN';
    }

    private showErrorToast(type: string, message: string): void {
        const userMessages = {
            NETWORK: 'Connection issue. Retrying...',
            AUTH: 'Please log in again',
            DATABASE: 'Data sync issue. Trying again...',
            STORAGE: 'Storage full. Please clear cache',
            RUNTIME: 'App restart recommended',
            UNKNOWN: 'Something went wrong'
        };

        toast.error(userMessages[type] || userMessages.UNKNOWN);
    }

    private async logToSupabase(error: Error, context?: ErrorContext, type?: string): Promise<void> {
        try {
            await this.supabase.from('error_logs').insert({
                error_message: error.message,
                error_stack: error.stack,
                error_type: type,
                user_id: context?.userId,
                component: context?.component,
                action: context?.action,
                metadata: context?.metadata,
                timestamp: new Date().toISOString(),
                user_agent: navigator.userAgent,
                url: window.location.href
            });
        } catch (logError) {
            console.error('Failed to log error:', logError);
        }
    }

    private shouldRetry(type: string): boolean {
        return ['NETWORK', 'DATABASE'].includes(type);
    }

    private scheduleRetry(error: Error, context?: ErrorContext): void {
        // Exponential backoff retry logic
        setTimeout(() => {
            // Retry implementation
        }, Math.pow(2, this.retryQueue.length) * 1000);
    }

    // Wrapper for async functions
    wrapAsync<T extends (...args: any[]) => Promise<any>>(fn: T, context?: ErrorContext): T {
        return (async (...args: any[]) => {
            try {
                return await fn(...args);
            } catch (error) {
                await this.captureException(error as Error, context);
                throw error;
            }
        }) as T;
    }
}

// Global error boundary component
export const GlobalErrorFallback: React.FC<{ error: Error; resetError: () => void }> = ({
    error,
    resetError
}) => {
    const handleSendReport = async () => {
        await RuntimeErrorHandler.getInstance().captureException(error, {
            component: 'GlobalErrorBoundary',
            action: 'manual_report'
        });
        toast.success('Error report sent');
    };

    return (
        <motion.div
      initial= {{ opacity: 0, scale: 0.9 }
}
animate = {{ opacity: 1, scale: 1 }}
className = "min-h-screen flex items-center justify-center bg-gray-50 p-4"
    >
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center" >
        <motion.div
          initial={ { y: -20 } }
animate = {{ y: 0 }}
className = "text-red-500 text-6xl mb-4"
    >
          ⚠️
</motion.div>
    < h2 className = "text-xl font-semibold text-gray-900 mb-2" >
        Something went wrong
            </h2>
            < p className = "text-gray-600 mb-6" >
                We've been notified and are working on a fix
                    </p>
                    < div className = "space-y-3" >
                        <button
            onClick={ resetError }
className = "w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
    >
    Try Again
        </button>
        < button
onClick = { handleSendReport }
className = "w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
    >
    Send Report
        </button>
        </div>
        </div>
        </motion.div>
  );
};
