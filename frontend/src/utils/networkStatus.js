/**
 * Network Status Utility for Drone Operations Manager
 * Detects and manages online/offline states
 */

// Create a custom event for network status changes
const networkStatusEvent = new CustomEvent('networkStatusChange', {
  detail: { online: navigator.onLine }
});

/**
 * Initialize network status monitoring
 * @param {Function} onlineCallback - Function to call when going online
 * @param {Function} offlineCallback - Function to call when going offline
 */
const initNetworkMonitoring = (onlineCallback, offlineCallback) => {
  // Initial status
  if (navigator.onLine) {
    onlineCallback && onlineCallback();
  } else {
    offlineCallback && offlineCallback();
  }
  
  // Monitor for changes
  window.addEventListener('online', () => {
    document.dispatchEvent(networkStatusEvent);
    onlineCallback && onlineCallback();
  });
  
  window.addEventListener('offline', () => {
    document.dispatchEvent(networkStatusEvent);
    offlineCallback && offlineCallback();
  });
};

/**
 * Check if the device is currently online
 * @returns {boolean} True if online, false if offline
 */
const isOnline = () => navigator.onLine;

/**
 * Subscribe to network status changes
 * @param {Function} callback - Function to call when network status changes
 * @returns {Function} Function to unsubscribe
 */
const subscribeToNetworkChanges = (callback) => {
  const handler = (event) => {
    callback(event.detail.online);
  };
  
  document.addEventListener('networkStatusChange', handler);
  
  return () => {
    document.removeEventListener('networkStatusChange', handler);
  };
};

export {
  initNetworkMonitoring,
  isOnline,
  subscribeToNetworkChanges
};
