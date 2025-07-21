import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import { RuntimeErrorHandler, GlobalErrorFallback } from '@runtime/runtime-error';
import { registerSW } from './utils/service-worker';
import App from './App';
import './styles/globals.css';

// Initialize error handler
const errorHandler = RuntimeErrorHandler.getInstance();

// Create React Query client with error handler
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                // Log error
                errorHandler.captureException(error as Error, {
                    component: 'ReactQuery',
                    action: 'query_retry',
                    metadata: { failureCount }
                });

                // Retry up to 3 times
                return failureCount < 3;
            },
            onError: (error) => {
                errorHandler.captureException(error as Error, {
                    component: 'ReactQuery',
                    action: 'query_error'
                });
            }
        },
        mutations: {
            onError: (error) => {
                errorHandler.captureException(error as Error, {
                    component: 'ReactQuery',
                    action: 'mutation_error'
                });
            }
        }
    }
});

// Register service worker
registerSW();

// Render app
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ErrorBoundary
            FallbackComponent={GlobalErrorFallback}
            onError={(error) => {
                errorHandler.captureException(error, {
                    component: 'React',
                    action: 'render_error'
                });
            }}
        >
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </QueryClientProvider>
        </ErrorBoundary>
    </React.StrictMode>
);