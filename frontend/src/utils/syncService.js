/**
 * Sync Service for Drone Operations Manager
 * Handles synchronization of data between offline storage and the backend API
 */

import axios from 'axios';
import { 
  getPendingChanges, 
  markChangeSynced, 
  deleteItem, 
  STORES,
  saveItem
} from './offlineStorage';
import { isOnline } from './networkStatus';

// Define API endpoints for each entity type
const API_ENDPOINTS = {
  projects: '/api/projects',
  zones: '/api/zones',
  workOrders: '/api/workorders',
  flights: '/api/flights'
};

// Track if sync is currently running
let isSyncing = false;

/**
 * Sync all pending changes with the backend
 * @returns {Promise<{success: boolean, synced: number, failed: number}>} Result of the sync operation
 */
const syncPendingChanges = async () => {
  // Don't run multiple syncs simultaneously
  if (isSyncing || !isOnline()) {
    return { success: false, synced: 0, failed: 0, message: 'Sync already in progress or offline' };
  }
  
  isSyncing = true;
  
  try {
    // Get all pending changes
    const pendingChanges = await getPendingChanges();
    const unsynced = pendingChanges.filter(change => !change.synced);
    
    if (unsynced.length === 0) {
      isSyncing = false;
      return { success: true, synced: 0, failed: 0, message: 'No changes to sync' };
    }
    
    let synced = 0;
    let failed = 0;
    
    // Process each pending change
    for (const change of unsynced) {
      try {
        const endpoint = API_ENDPOINTS[change.entityType];
        
        if (!endpoint) {
          console.error(`Unknown entity type: ${change.entityType}`);
          failed++;
          continue;
        }
        
        let response;
        
        // Perform the appropriate API call based on the operation type
        switch (change.operation) {
          case 'create':
            response = await axios.post(endpoint, change.data);
            break;
            
          case 'update':
            response = await axios.put(`${endpoint}/${change.data.id}`, change.data);
            break;
            
          case 'delete':
            response = await axios.delete(`${endpoint}/${change.data.id}`);
            break;
            
          default:
            console.error(`Unknown operation: ${change.operation}`);
            failed++;
            continue;
        }
        
        // If successful, mark as synced
        if (response.status >= 200 && response.status < 300) {
          await markChangeSynced(change.id);
          synced++;
          
          // If this was a create or update, update the local data with the server response
          if ((change.operation === 'create' || change.operation === 'update') && response.data) {
            await saveItem(change.entityType, response.data);
          }
        } else {
          failed++;
        }
      } catch (error) {
        console.error('Error syncing change:', error);
        failed++;
      }
    }
    
    isSyncing = false;
    return { 
      success: failed === 0, 
      synced, 
      failed,
      message: `Synced ${synced} changes, ${failed} failed`
    };
  } catch (error) {
    console.error('Error in sync process:', error);
    isSyncing = false;
    return { 
      success: false, 
      synced: 0, 
      failed: 0, 
      message: `Sync error: ${error.message}` 
    };
  }
};

/**
 * Fetch and store data from the backend for offline use
 * @param {string} entityType - Type of entity to fetch (projects, zones, etc.)
 * @returns {Promise<Array>} A promise that resolves to the fetched data
 */
const fetchAndStoreData = async (entityType) => {
  if (!isOnline()) {
    throw new Error('Cannot fetch data while offline');
  }
  
  try {
    const endpoint = API_ENDPOINTS[entityType];
    
    if (!endpoint) {
      throw new Error(`Unknown entity type: ${entityType}`);
    }
    
    const response = await axios.get(endpoint);
    
    if (response.data) {
      // Store all items in IndexedDB
      for (const item of response.data) {
        await saveItem(entityType, item);
      }
      
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching ${entityType}:`, error);
    throw error;
  }
};

/**
 * Register for background sync (if browser supports it)
 * @returns {Promise<boolean>} Whether registration was successful
 */
const registerBackgroundSync = async () => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-drone-ops-data');
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }
  return false;
};

/**
 * Initialize sync when coming online
 * @param {Function} onSyncComplete - Callback when sync completes
 */
const initAutoSync = (onSyncComplete) => {
  window.addEventListener('online', async () => {
    const result = await syncPendingChanges();
    if (onSyncComplete) {
      onSyncComplete(result);
    }
  });
  
  // Also try to register for background sync
  registerBackgroundSync();
};

export {
  syncPendingChanges,
  fetchAndStoreData,
  registerBackgroundSync,
  initAutoSync
};
