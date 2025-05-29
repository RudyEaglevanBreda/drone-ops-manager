/**
 * Offline Storage Utility for Drone Operations Manager
 * This module handles storing and retrieving data when offline
 */

// Database name and version
const DB_NAME = 'droneOpsManager';
const DB_VERSION = 1;

// Store names for different types of data
const STORES = {
  PROJECTS: 'projects',
  ZONES: 'zones',
  WORK_ORDERS: 'workOrders',
  FLIGHTS: 'flights',
  PENDING_CHANGES: 'pendingChanges',
  USER_DATA: 'userData'
};

/**
 * Open the IndexedDB database
 * @returns {Promise<IDBDatabase>} A promise that resolves to the database instance
 */
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    // Create object stores when database is first created or upgraded
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create stores for all entity types if they don't exist
      if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
        db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.ZONES)) {
        db.createObjectStore(STORES.ZONES, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.WORK_ORDERS)) {
        db.createObjectStore(STORES.WORK_ORDERS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.FLIGHTS)) {
        db.createObjectStore(STORES.FLIGHTS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.PENDING_CHANGES)) {
        db.createObjectStore(STORES.PENDING_CHANGES, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
      }
      
      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' });
      }
    };
  });
};

/**
 * Get all items from a store
 * @param {string} storeName - Name of the store to retrieve data from
 * @returns {Promise<Array>} A promise that resolves to an array of items
 */
const getAllItems = async (storeName) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get an item by id from a store
 * @param {string} storeName - Name of the store
 * @param {string|number} id - ID of the item to retrieve
 * @returns {Promise<Object>} A promise that resolves to the item
 */
const getItemById = async (storeName, id) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Save an item to a store
 * @param {string} storeName - Name of the store
 * @param {Object} item - Item to save
 * @returns {Promise<Object>} A promise that resolves to the saved item
 */
const saveItem = async (storeName, item) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);
    
    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Save multiple items to a store
 * @param {string} storeName - Name of the store
 * @param {Array<Object>} items - Items to save
 * @returns {Promise<Array<Object>>} A promise that resolves to the saved items
 */
const saveItems = async (storeName, items) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    let completed = 0;
    let failed = false;
    
    transaction.oncomplete = () => resolve(items);
    transaction.onerror = () => {
      if (!failed) {
        failed = true;
        reject(transaction.error);
      }
    };
    
    items.forEach(item => {
      const request = store.put(item);
      request.onerror = () => {
        if (!failed) {
          failed = true;
          reject(request.error);
        }
      };
    });
  });
};

/**
 * Delete an item from a store
 * @param {string} storeName - Name of the store
 * @param {string|number} id - ID of the item to delete
 * @returns {Promise<void>} A promise that resolves when the item is deleted
 */
const deleteItem = async (storeName, id) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Queue a change to be synced when online
 * @param {string} operation - Type of operation ('create', 'update', 'delete')
 * @param {string} entityType - Type of entity (projects, zones, etc.)
 * @param {Object} data - Data associated with the change
 * @returns {Promise<number>} A promise that resolves to the ID of the queued change
 */
const queueChange = async (operation, entityType, data) => {
  const timestamp = new Date().toISOString();
  const change = {
    operation,
    entityType,
    data,
    timestamp,
    synced: false
  };
  
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.PENDING_CHANGES, 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_CHANGES);
    const request = store.add(change);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get all pending changes that need to be synced
 * @returns {Promise<Array>} A promise that resolves to an array of pending changes
 */
const getPendingChanges = async () => {
  return getAllItems(STORES.PENDING_CHANGES);
};

/**
 * Mark a change as synced
 * @param {number} changeId - ID of the change to mark as synced
 * @returns {Promise<void>} A promise that resolves when the change is marked as synced
 */
const markChangeSynced = async (changeId) => {
  const change = await getItemById(STORES.PENDING_CHANGES, changeId);
  if (change) {
    change.synced = true;
    await saveItem(STORES.PENDING_CHANGES, change);
  }
};

/**
 * Save user data (like authentication tokens)
 * @param {string} key - Key to store the data under
 * @param {any} data - Data to store
 * @returns {Promise<Object>} A promise that resolves to the saved data
 */
const saveUserData = async (key, data) => {
  return saveItem(STORES.USER_DATA, { key, data });
};

/**
 * Get user data by key
 * @param {string} key - Key of the data to retrieve
 * @returns {Promise<any>} A promise that resolves to the data
 */
const getUserData = async (key) => {
  const item = await getItemById(STORES.USER_DATA, key);
  return item ? item.data : null;
};

/**
 * Clear all data from a store
 * @param {string} storeName - Name of the store to clear
 * @returns {Promise<void>} A promise that resolves when the store is cleared
 */
const clearStore = async (storeName) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export {
  STORES,
  getAllItems,
  getItemById,
  saveItem,
  saveItems,
  deleteItem,
  queueChange,
  getPendingChanges,
  markChangeSynced,
  saveUserData,
  getUserData,
  clearStore
};
