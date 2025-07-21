import { RuntimeErrorHandler } from '@runtime/runtime-error';

/**
 * Initialize browser fingerprinting
 */
export async function initializeFingerprint(): Promise<string> {
    const errorHandler = RuntimeErrorHandler.getInstance();

    try {
        // Import FingerprintJS dynamically
        const FingerprintJS = await import('@fingerprintjs/fingerprintjs');

        // Initialize an agent
        const fpPromise = FingerprintJS.default.load();

        // Get the visitor identifier
        const fp = await fpPromise;
        const result = await fp.get();

        // Store fingerprint in localStorage for later comparison
        localStorage.setItem('edusage_fingerprint', result.visitorId);

        return result.visitorId;
    } catch (error) {
        errorHandler.captureException(error as Error, {
            component: 'fingerprint',
            action: 'initialize',
            severity: 'high'
        });

        // Return a fallback fingerprint based on navigator properties
        return generateFallbackFingerprint();
    }
}

/**
 * Verify that the current fingerprint matches the stored one
 */
export async function verifyFingerprint(
    currentFingerprint?: string,
    storedFingerprint?: string
): Promise<boolean> {
    const errorHandler = RuntimeErrorHandler.getInstance();

    try {
        // If fingerprints are provided, compare them directly
        if (currentFingerprint && storedFingerprint) {
            return currentFingerprint === storedFingerprint;
        }

        // Otherwise, get the stored fingerprint from localStorage
        const storedFp = localStorage.getItem('edusage_fingerprint');
        if (!storedFp) return true; // No stored fingerprint, consider it valid

        // Get current fingerprint
        const currentFp = currentFingerprint || await initializeFingerprint();

        return currentFp === storedFp;
    } catch (error) {
        errorHandler.captureException(error as Error, {
            component: 'fingerprint',
            action: 'verify',
            severity: 'high'
        });

        // In case of error, return true to avoid locking users out
        return true;
    }
}

/**
 * Generate a simple fallback fingerprint based on navigator properties
 */
function generateFallbackFingerprint(): string {
    const errorHandler = RuntimeErrorHandler.getInstance();

    try {
        const { userAgent, language, platform } = navigator;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const colorDepth = window.screen.colorDepth;
        const pixelRatio = window.devicePixelRatio || 1;

        const components = [
            userAgent,
            language,
            platform,
            screenWidth,
            screenHeight,
            colorDepth,
            pixelRatio
        ].join('|');

        // Create a simple hash of the components
        return hashString(components);
    } catch (error) {
        errorHandler.captureException(error as Error, {
            component: 'fingerprint',
            action: 'generateFallback',
            severity: 'medium'
        });

        // Return a random string as last resort
        return Math.random().toString(36).substring(2, 15);
    }
}

/**
 * Simple string hashing function
 */
function hashString(str: string): string {
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    // Convert to hex string
    return (hash >>> 0).toString(16);
}