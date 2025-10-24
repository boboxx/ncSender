import { contextBridge, nativeTheme, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('ncSender', {
  theme: {
    shouldUseDark: () => nativeTheme.shouldUseDarkColors
  },
  
  cnc: {
    // Connection management
    listPorts: () => ipcRenderer.invoke('cnc-list-ports'),
    connect: (portPath, baudRate) => ipcRenderer.invoke('cnc-connect', portPath, baudRate),
    disconnect: () => ipcRenderer.invoke('cnc-disconnect'),
    getStatus: () => ipcRenderer.invoke('cnc-get-status'),
    requestStatus: () => ipcRenderer.invoke('cnc-request-status'),
    
    // Command sending
    sendCommand: (command) => ipcRenderer.invoke('cnc-send-command', command),
    sendRealTimeCommand: (command) => ipcRenderer.invoke('cnc-send-realtime-command', command),
    
    // Event listeners
    onData: (callback) => {
      ipcRenderer.on('cnc-data', (event, data) => callback(data));
      return () => ipcRenderer.removeAllListeners('cnc-data');
    },
    onStatusReport: (callback) => {
      ipcRenderer.on('cnc-status-report', (event, status) => callback(status));
      return () => ipcRenderer.removeAllListeners('cnc-status-report');
    },
    onSystemMessage: (callback) => {
      ipcRenderer.on('cnc-system-message', (event, message) => callback(message));
      return () => ipcRenderer.removeAllListeners('cnc-system-message');
    },
    onResponse: (callback) => {
      ipcRenderer.on('cnc-response', (event, response) => callback(response));
      return () => ipcRenderer.removeAllListeners('cnc-response');
    }
  },

  updates: {
    checkForUpdates: () => ipcRenderer.invoke('updates/check'),
    downloadUpdate: (options = {}) => ipcRenderer.invoke('updates/download', options),
    installUpdate: () => ipcRenderer.invoke('updates/install'),
    onChecking: (callback) => {
      const listener = (_event, payload) => callback(payload);
      ipcRenderer.on('updates:checking', listener);
      return () => ipcRenderer.removeListener('updates:checking', listener);
    },
    onAvailable: (callback) => {
      const listener = (_event, payload) => callback(payload);
      ipcRenderer.on('updates:available', listener);
      return () => ipcRenderer.removeListener('updates:available', listener);
    },
    onNotAvailable: (callback) => {
      const listener = (_event, payload) => callback(payload);
      ipcRenderer.on('updates:not-available', listener);
      return () => ipcRenderer.removeListener('updates:not-available', listener);
    },
    onError: (callback) => {
      const listener = (_event, payload) => callback(payload);
      ipcRenderer.on('updates:error', listener);
      return () => ipcRenderer.removeListener('updates:error', listener);
    },
    onDownloadStarted: (callback) => {
      const listener = (_event, payload) => callback(payload);
      ipcRenderer.on('updates:download-started', listener);
      return () => ipcRenderer.removeListener('updates:download-started', listener);
    },
    onDownloadProgress: (callback) => {
      const listener = (_event, payload) => callback(payload);
      ipcRenderer.on('updates:download-progress', listener);
      return () => ipcRenderer.removeListener('updates:download-progress', listener);
    },
    onDownloaded: (callback) => {
      const listener = (_event, payload) => callback(payload);
      ipcRenderer.on('updates:downloaded', listener);
      return () => ipcRenderer.removeListener('updates:downloaded', listener);
    }
  }
});
