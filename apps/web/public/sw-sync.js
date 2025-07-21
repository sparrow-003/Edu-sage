// EDUΣAGE Background Sync Service Worker
const SYNC_TAG = 'edusage-background-sync';
const DB_NAME = 'EdusageOfflineDB';
const DB_VERSION = 1;

// Background sync registration
self.addEventListener('sync', (event) => {
  console.log('[Sync SW] Background sync event:', event.tag);
  
  if (event.tag === SYNC_TAG) {
    event.waitUntil(performBackgroundSync());
  }
});

// Periodic background sync (for PWA)
self.addEventListener('periodicsync', (event) => {
  console.log('[Sync SW] Periodic sync event:', event.tag);
  
  if (event.tag === 'edusage-periodic-sync') {
    event.waitUntil(performPeriodicSync());
  }
});

// Main background sync function
async function performBackgroundSync() {
  try {
    console.log('[Sync SW] Starting background sync...');
    
    // Check network connectivity
    if (!navigator.onLine) {
      console.log('[Sync SW] No network connection, skipping sync');
      return;
    }

    const db = await openDB();
    
    // Sync different types of data
    await Promise.all([
      syncQueuedActions(db),
      syncUserProgress(db),
      syncMemoryEntries(db),
      syncVideoProgress(db),
      syncOfflineQuizResults(db),
    ]);
    
    console.log('[Sync SW] Background sync completed successfully');
    
    // Notify main thread of successful sync
    await notifyClients({ type: 'SYNC_COMPLETE', success: true });
    
  } catch (error) {
    console.error('[Sync SW] Background sync failed:', error);
    await notifyClients({ type: 'SYNC_ERROR', error: error.message });
  }
}

// Periodic sync for regular updates
async function performPeriodicSync() {
  try {
    console.log('[Sync SW] Starting periodic sync...');
    
    if (!navigator.onLine) return;
    
    const db = await openDB();
    
    // Lighter sync operations for periodic updates
    await Promise.all([
      syncCriticalData(db),
      cleanupOldData(db),
      prefetchRecommendedContent(db),
    ]);
    
    console.log('[Sync SW] Periodic sync completed');
    
  } catch (error) {
    console.error('[Sync SW] Periodic sync failed:', error);
  }
}

// Sync queued actions (user interactions stored offline)
async function syncQueuedActions(db) {
  const transaction = db.transaction(['sync_queue'], 'readwrite');
  const store = transaction.objectStore('sync_queue');
  const index = store.index('timestamp');
  
  const queuedActions = await getAllFromIndex(index);
  console.log(`[Sync SW] Syncing ${queuedActions.length} queued actions`);
  
  const batchSize = 10; // Process in batches to avoid overwhelming the server
  
  for (let i = 0; i < queuedActions.length; i += batchSize) {
    const batch = queuedActions.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (action) => {
      try {
        await syncSingleAction(action);
        
        // Remove from queue after successful sync
        const deleteTransaction = db.transaction(['sync_queue'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('sync_queue');
        await deleteStore.delete(action.id);
        
        console.log('[Sync SW] Synced action:', action.type);
        
      } catch (error) {
        console.error('[Sync SW] Failed to sync action:', action, error);
        
        // Update retry count
        action.retryCount = (action.retryCount || 0) + 1;
        
        if (action.retryCount < 3) {
          // Update the action with new retry count
          const updateTransaction = db.transaction(['sync_queue'], 'readwrite');
          const updateStore = updateTransaction.objectStore('sync_queue');
          await updateStore.put(action);
        } else {
          // Remove after 3 failed attempts
          const deleteTransaction = db.transaction(['sync_queue'], 'readwrite');
          const deleteStore = deleteTransaction.objectStore('sync_queue');
          await deleteStore.delete(action.id);
          console.log('[Sync SW] Removed action after 3 failed attempts:', action);
        }
      }
    }));
  }
}

// Sync individual action
async function syncSingleAction(action) {
  const { url, method, headers, body, type } = action;
  
  const response = await fetch(url, {
    method: method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const result = await response.json();
  
  // Handle different types of sync responses
  switch (type) {
    case 'memory_entry':
      await handleMemorySyncResponse(result, action);
      break;
    case 'quiz_result':
      await handleQuizSyncResponse(result, action);
      break;
    case 'user_progress':
      await handleProgressSyncResponse(result, action);
      break;
    case 'video_progress':
      await handleVideoSyncResponse(result, action);
      break;
  }
  
  return result;
}

// Sync user progress data
async function syncUserProgress(db) {
  const transaction = db.transaction(['user_progress'], 'readonly');
  const store = transaction.objectStore('user_progress');
  const progressData = await getAll(store);
  
  if (progressData.length === 0) return;
  
  console.log(`[Sync SW] Syncing ${progressData.length} progress entries`);
  
  // Batch progress updates
  const batchedProgress = chunkArray(progressData, 20);
  
  for (const batch of batchedProgress) {
    try {
      const response = await fetch('/api/sync/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressEntries: batch }),
      });
      
      if (response.ok) {
        // Clear synced progress data
        const clearTransaction = db.transaction(['user_progress'], 'readwrite');
        const clearStore = clearTransaction.objectStore('user_progress');
        
        for (const entry of batch) {
          await clearStore.delete(entry.id);
        }
      }
    } catch (error) {
      console.error('[Sync SW] Failed to sync progress batch:', error);
    }
  }
}

// Sync memory entries
async function syncMemoryEntries(db) {
  const transaction = db.transaction(['pending_memories'], 'readonly');
  const store = transaction.objectStore('pending_memories');
  const memories = await getAll(store);
  
  if (memories.length === 0) return;
  
  console.log(`[Sync SW] Syncing ${memories.length} memory entries`);
  
  for (const memory of memories) {
    try {
      const response = await fetch('/api/memory-bank/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memory.data),
      });
      
      if (response.ok) {
        // Remove from pending memories
        const deleteTransaction = db.transaction(['pending_memories'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('pending_memories');
        await deleteStore.delete(memory.id);
      }
    } catch (error) {
      console.error('[Sync SW] Failed to sync memory:', memory, error);
    }
  }
}

// Sync video progress
async function syncVideoProgress(db) {
  const transaction = db.transaction(['video_progress'], 'readonly');
  const store = transaction.objectStore('video_progress');
  const videoProgress = await getAll(store);
  
  if (videoProgress.length === 0) return;
  
  console.log(`[Sync SW] Syncing ${videoProgress.length} video progress entries`);
  
  // Group by user for efficient syncing
  const progressByUser = groupBy(videoProgress, 'userId');
  
  for (const [userId, userProgress] of Object.entries(progressByUser)) {
    try {
      const response = await fetch(`/api/users/${userId}/video-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressEntries: userProgress }),
      });
      
      if (response.ok) {
        // Clear synced video progress
        const clearTransaction = db.transaction(['video_progress'], 'readwrite');
        const clearStore = clearTransaction.objectStore('video_progress');
        
        for (const entry of userProgress) {
          await clearStore.delete(entry.id);
        }
      }
    } catch (error) {
      console.error('[Sync SW] Failed to sync video progress for user:', userId, error);
    }
  }
}

// Sync offline quiz results
async function syncOfflineQuizResults(db) {
  const transaction = db.transaction(['offline_quiz_results'], 'readonly');
  const store = transaction.objectStore('offline_quiz_results');
  const quizResults = await getAll(store);
  
  if (quizResults.length === 0) return;
  
  console.log(`[Sync SW] Syncing ${quizResults.length} offline quiz results`);
  
  for (const result of quizResults) {
    try {
      const response = await fetch('/api/ai-agents/quiz', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });
      
      if (response.ok) {
        // Remove from offline results
        const deleteTransaction = db.transaction(['offline_quiz_results'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('offline_quiz_results');
        await deleteStore.delete(result.id);
        
        // Store the processed result
        const processedResult = await response.json();
        const storeTransaction = db.transaction(['quiz_results'], 'readwrite');
        const resultStore = storeTransaction.objectStore('quiz_results');
        await resultStore.put(processedResult);
      }
    } catch (error) {
      console.error('[Sync SW] Failed to sync quiz result:', result, error);
    }
  }
}

// Sync critical data (lightweight periodic sync)
async function syncCriticalData(db) {
  try {
    // Sync user profile updates
    const profileTransaction = db.transaction(['profile_updates'], 'readonly');
    const profileStore = profileTransaction.objectStore('profile_updates');
    const profileUpdates = await getAll(profileStore);
    
    for (const update of profileUpdates) {
      const response = await fetch(`/api/memory-bank/profiles/${update.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update.data),
      });
      
      if (response.ok) {
        const deleteTransaction = db.transaction(['profile_updates'], 'readwrite');
        const deleteStore = deleteTransaction.objectStore('profile_updates');
        await deleteStore.delete(update.id);
      }
    }
  } catch (error) {
    console.error('[Sync SW] Failed to sync critical data:', error);
  }
}

// Cleanup old data
async function cleanupOldData(db) {
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  const stores = ['cached_content', 'old_quiz_results', 'expired_sessions'];
  
  for (const storeName of stores) {
    try {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore('store');
      const index = store.index('timestamp');
      
      const oldEntries = await getAllFromIndex(index, IDBKeyRange.upperBound(oneWeekAgo));
      
      for (const entry of oldEntries) {
        await store.delete(entry.id);
      }
      
      console.log(`[Sync SW] Cleaned up ${oldEntries.length} old entries from ${storeName}`);
    } catch (error) {
      console.error(`[Sync SW] Failed to cleanup ${storeName}:`, error);
    }
  }
}

// Prefetch recommended content
async function prefetchRecommendedContent(db) {
  try {
    // Get user's current learning context
    const userTransaction = db.transaction(['current_user'], 'readonly');
    const userStore = userTransaction.objectStore('current_user');
    const currentUser = await get(userStore, 'active_user');
    
    if (!currentUser) return;
    
    // Fetch recommendations
    const response = await fetch(`/api/recommendations/${currentUser.id}`);
    if (!response.ok) return;
    
    const recommendations = await response.json();
    
    // Cache recommended content
    const cacheTransaction = db.transaction(['recommended_content'], 'readwrite');
    const cacheStore = cacheTransaction.objectStore('recommended_content');
    
    for (const recommendation of recommendations.content) {
      await cacheStore.put({
        id: recommendation.id,
        data: recommendation,
        timestamp: Date.now(),
        userId: currentUser.id,
      });
    }
    
    console.log(`[Sync SW] Prefetched ${recommendations.content.length} recommended content items`);
    
  } catch (error) {
    console.error('[Sync SW] Failed to prefetch content:', error);
  }
}

// Utility functions
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create all necessary object stores
      const stores = [
        'sync_queue',
        'user_progress', 
        'pending_memories',
        'video_progress',
        'offline_quiz_results',
        'profile_updates',
        'cached_content',
        'old_quiz_results',
        'expired_sessions',
        'recommended_content',
        'current_user',
        'quiz_results'
      ];
      
      stores.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          if (storeName === 'video_progress' || storeName === 'user_progress') {
            store.createIndex('userId', 'userId', { unique: false });
          }
        }
      });
    };
  });
}

async function getAll(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllFromIndex(index, range = null) {
  return new Promise((resolve, reject) => {
    const request = range ? index.getAll(range) : index.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function get(store, key) {
  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function groupBy(array, key) {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
}

async function notifyClients(message) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage(message);
  });
}

// Handle sync response types
async function handleMemorySyncResponse(result, action) {
  // Update local memory store with server response
  const db = await openDB();
  const transaction = db.transaction(['memories'], 'readwrite');
  const store = transaction.objectStore('memories');
  await store.put(result);
}

async function handleQuizSyncResponse(result, action) {
  // Store processed quiz results
  const db = await openDB();
  const transaction = db.transaction(['quiz_results'], 'readwrite');
  const store = transaction.objectStore('quiz_results');
  await store.put(result);
}

async function handleProgressSyncResponse(result, action) {
  // Update progress tracking
  const db = await openDB();
  const transaction = db.transaction(['user_analytics'], 'readwrite');
  const store = transaction.objectStore('user_analytics');
  await store.put(result);
}

async function handleVideoSyncResponse(result, action) {
  // Update video progress tracking
  const db = await openDB();
  const transaction = db.transaction(['synced_video_progress'], 'readwrite');
  const store = transaction.objectStore('synced_video_progress');
  await store.put(result);
}