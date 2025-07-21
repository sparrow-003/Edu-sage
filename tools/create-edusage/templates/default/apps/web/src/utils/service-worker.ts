import { Workbox } from 'workbox-window';
import { RuntimeErrorHandler } from '@runtime/runtime-error';

/**
 * Register the service worker for PWA functionality
 */
export function registerSW(): void {
    const errorHandler = RuntimeErrorHandler.getInstance();

    try {
        // Check if service workers are supported
        if ('serviceWorker' in navigator) {
            const wb = new Workbox('/sw.js');

            // Add event listeners for service worker lifecycle
            wb.addEventListener('installed', (event) => {
                if (event.isUpdate) {
                    // New service worker is available, show update notification
                    showUpdateNotification();
                }
            });

            wb.addEventListener('controlling', () => {
                // Service worker is controlling the page, reload for new version
                window.location.reload();
            });

            wb.addEventListener('activated', (event) => {
                // Service worker is active
                if (!event.isUpdate) {
                    // First-time install, show offline-ready notification
                    showOfflineReadyNotification();
                }
            });

            wb.addEventListener('waiting', () => {
                // New service worker is waiting, show update notification
                showUpdateNotification();
            });

            // Register the service worker
            wb.register()
                .then((registration) => {
                    console.log('Service worker registered:', registration);
                })
                .catch((error) => {
                    errorHandler.captureException(error, {
                        component: 'service-worker',
                        action: 'register',
                        severity: 'high'
                    });
                });
        }
    } catch (error) {
        errorHandler.captureException(error as Error, {
            component: 'service-worker',
            action: 'registerSW',
            severity: 'high'
        });
    }
}

/**
 * Show a notification when a new version is available
 */
function showUpdateNotification(): void {
    const errorHandler = RuntimeErrorHandler.getInstance();

    try {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-cyan-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center';
        notification.innerHTML = `
      <div class="mr-4">
        <p class="font-medium">New version available!</p>
        <p class="text-sm">Refresh to update the application.</p>
      </div>
      <button class="px-4 py-2 bg-white text-cyan-600 rounded-md hover:bg-gray-100">
        Update
      </button>
    `;

        // Add to document
        document.body.appendChild(notification);

        // Add click handler for update button
        const updateButton = notification.querySelector('button');
        if (updateButton) {
            updateButton.addEventListener('click', () => {
                window.location.reload();
            });
        }

        // Remove after 10 seconds if not clicked
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 10000);
    } catch (error) {
        errorHandler.captureException(error as Error, {
            component: 'service-worker',
            action: 'showUpdateNotification',
            severity: 'medium'
        });
    }
}

/**
 * Show a notification when the app is ready for offline use
 */
function showOfflineReadyNotification(): void {
    const errorHandler = RuntimeErrorHandler.getInstance();

    try {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center';
        notification.innerHTML = `
      <div class="mr-4">
        <p class="font-medium">App ready for offline use!</p>
        <p class="text-sm">You can now use EduΣage without an internet connection.</p>
      </div>
      <button class="px-4 py-2 bg-white text-green-600 rounded-md hover:bg-gray-100">
        Dismiss
      </button>
    `;

        // Add to document
        document.body.appendChild(notification);

        // Add click handler for dismiss button
        const dismissButton = notification.querySelector('button');
        if (dismissButton) {
            dismissButton.addEventListener('click', () => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            });
        }

        // Remove after 5 seconds if not clicked
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 5000);
    } catch (error) {
        errorHandler.captureException(error as Error, {
            component: 'service-worker',
            action: 'showOfflineReadyNotification',
            severity: 'medium'
        });
    }
}