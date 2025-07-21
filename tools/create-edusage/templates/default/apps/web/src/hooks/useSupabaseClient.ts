import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { RuntimeErrorHandler } from '@runtime/runtime-error';

/**
 * Hook to get a Supabase client instance with error handling
 */
export function useSupabaseClient(): SupabaseClient {
    const [client, setClient] = useState<SupabaseClient | null>(null);
    const errorHandler = RuntimeErrorHandler.getInstance();

    useEffect(() => {
        try {
            // Create Supabase client
            const supabase = createClient(
                process.env.VITE_SUPABASE_URL!,
                process.env.VITE_SUPABASE_ANON_KEY!
            );

            // Add error handling to client
            const wrappedClient = wrapClientWithErrorHandling(supabase);

            setClient(wrappedClient);
        } catch (error) {
            errorHandler.captureException(error as Error, {
                component: 'useSupabaseClient',
                action: 'initialize',
                severity: 'critical'
            });
        }
    }, []);

    // Return client or throw error if not initialized
    if (!client) {
        throw new Error('Supabase client not initialized');
    }

    return client;
}

/**
 * Wrap Supabase client methods with error handling
 */
function wrapClientWithErrorHandling(client: SupabaseClient): SupabaseClient {
    const errorHandler = RuntimeErrorHandler.getInstance();

    // Create a proxy to intercept method calls
    return new Proxy(client, {
        get(target, prop, receiver) {
            const value = Reflect.get(target, prop, receiver);

            // If the property is a function, wrap it with error handling
            if (typeof value === 'function') {
                return function (...args: any[]) {
                    try {
                        const result = value.apply(target, args);

                        // If the result is a promise, add error handling
                        if (result instanceof Promise) {
                            return result.catch((error) => {
                                errorHandler.captureException(error, {
                                    component: 'SupabaseClient',
                                    action: String(prop),
                                    metadata: { args: JSON.stringify(args) },
                                    severity: 'high'
                                });
                                throw error;
                            });
                        }

                        return result;
                    } catch (error) {
                        errorHandler.captureException(error as Error, {
                            component: 'SupabaseClient',
                            action: String(prop),
                            metadata: { args: JSON.stringify(args) },
                            severity: 'high'
                        });
                        throw error;
                    }
                };
            }

            // If the property is an object with methods, wrap it recursively
            if (typeof value === 'object' && value !== null) {
                return wrapClientWithErrorHandling(value as any);
            }

            return value;
        }
    }) as SupabaseClient;
}