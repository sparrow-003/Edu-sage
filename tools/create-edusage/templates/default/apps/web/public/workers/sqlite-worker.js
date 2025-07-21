// SQLite Worker for handling database operations in a separate thread

// Import SQL.js (this will be loaded by the main thread)
importScripts('/sql-wasm.js');

// Initialize variables
let db = null;
let initialized = false;

// Handle messages from the main thread
self.onmessage = async function (event) {
    const { action, sql, params, schema, id } = event.data;

    try {
        switch (action) {
            case 'init':
                await initializeDatabase(schema);
                break;

            case 'execute':
                const result = executeQuery(sql, params);
                self.postMessage({ action, result, id });
                break;

            default:
                throw new Error(`Unknown action: ${action}`);
        }
    } catch (error) {
        self.postMessage({
            action,
            error: error.message,
            id
        });
    }
};

// Initialize the SQLite database
async function initializeDatabase(schema) {
    try {
        if (initialized) {
            return;
        }

        // Load SQL.js
        const SQL = await initSqlJs();

        // Create a new database
        db = new SQL.Database();

        // Execute schema creation SQL
        if (schema) {
            db.exec(schema);
        }

        initialized = true;

        // Notify main thread that initialization is complete
        self.postMessage({ action: 'init', result: 'Database initialized' });
    } catch (error) {
        self.postMessage({ action: 'init', error: error.message });
        throw error;
    }
}

// Execute a SQL query
function executeQuery(sql, params = []) {
    if (!initialized || !db) {
        throw new Error('Database not initialized');
    }

    try {
        // Prepare statement
        const stmt = db.prepare(sql);

        // Bind parameters
        if (params && params.length > 0) {
            stmt.bind(params);
        }

        // Execute query
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }

        // Finalize statement
        stmt.free();

        return results;
    } catch (error) {
        throw new Error(`SQL error: ${error.message}`);
    }
}