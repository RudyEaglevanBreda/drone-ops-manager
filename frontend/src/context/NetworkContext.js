import React, { createContext, useContext, useState, useEffect } from 'react';
import { initNetworkMonitoring, isOnline } from '../utils/networkStatus';
import { syncPendingChanges, initAutoSync } from '../utils/syncService';

const NetworkContext = createContext();

export function useNetwork() {
  return useContext(NetworkContext);
}

export function NetworkProvider({ children }) {
  const [online, setOnline] = useState(isOnline());
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  // Initialize network monitoring
  useEffect(() => {
    initNetworkMonitoring(
      // Online callback
      () => {
        setOnline(true);
        // Try to sync pending changes when we come back online
        handleSync();
      },
      // Offline callback
      () => {
        setOnline(false);
      }
    );

    // Initialize auto-sync when coming online
    initAutoSync((result) => {
      setLastSyncResult(result);
      setSyncing(false);
    });
  }, []);

  // Function to manually trigger sync
  const handleSync = async () => {
    if (!online || syncing) return;
    
    setSyncing(true);
    try {
      const result = await syncPendingChanges();
      setLastSyncResult(result);
    } catch (error) {
      setLastSyncResult({
        success: false,
        message: `Sync error: ${error.message}`
      });
    } finally {
      setSyncing(false);
    }
  };

  const value = {
    online,
    syncing,
    lastSyncResult,
    sync: handleSync
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}
