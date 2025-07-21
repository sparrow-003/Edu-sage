import { useEffect, useState } from 'react';
import { RuntimeErrorHandler } from '@runtime/runtime-error';
import { createSQLiteClient, SQLiteClient, initializeSQLite } from '../utils/sqlite';

/**
 * Hook to get a SQLite client instance with error handling
 */
export function useSQLiteClient(): SQLiteClient {
    const [client, setClient] = useState<SQLiteClient | null>(null);
    const errorHandler = RuntimeErrorHandler.getInstance();

    useEffect(() => {
        const initClient = async () => {
            try {
                // Initialize SQLite if not already initialized
                await initializeSQLite();

                // Create SQLite client
                const sqliteClient = createSQLiteClient();

                setClient(sqliteClient);
            } catch (error) {
                errorHandler.captureException(error as Error, {
                    component: 'useSQLiteClient',
                    action: 'initialize',
                    severity: 'high'
                });
            }
        };

        initClient();
    }, []);

    // Return client or throw error if not initialized
    if (!client) {
        throw new Error('SQLite client not initialized');
    }

    return client;
}