/**
 * Storage utilities for the Real Estate Communication Assistant
 * Provides methods to store and retrieve data from localStorage with error handling
 */

// Storage Keys
const STORAGE_KEYS = {
    CLIENTS: 'realEstateClients',
    CONVERSATIONS: 'realEstateConversations',
    NOTES: 'realEstateNotes',
    USER_PREFERENCES: 'realEstateUserPreferences',
    LANGUAGE_PREFERENCE: 'realEstateLanguagePreference',
    SESSION_DATA: 'realEstateSessionData'
  };
  
  /**
   * Check if localStorage is available
   * @returns {boolean} Whether localStorage is available
   */
  const isStorageAvailable = () => {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  /**
   * Store data in localStorage
   * @param {string} key - Storage key
   * @param {any} data - Data to store (will be JSON stringified)
   * @returns {boolean} Success status
   */
  export const storeData = (key, data) => {
    if (!isStorageAvailable()) {
      console.error('localStorage is not available');
      return false;
    }
    
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return false;
    }
  };
  
  /**
   * Retrieve data from localStorage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value to return if key not found
   * @returns {any} Retrieved data or defaultValue
   */
  export const retrieveData = (key, defaultValue = null) => {
    if (!isStorageAvailable()) {
      console.error('localStorage is not available');
      return defaultValue;
    }
    
    try {
      const serializedData = localStorage.getItem(key);
      
      if (serializedData === null) {
        return defaultValue;
      }
      
      return JSON.parse(serializedData);
    } catch (error) {
      console.error('Error retrieving data:', error);
      return defaultValue;
    }
  };
  
  /**
   * Remove data from localStorage
   * @param {string} key - Storage key to remove
   * @returns {boolean} Success status
   */
  export const removeData = (key) => {
    if (!isStorageAvailable()) {
      console.error('localStorage is not available');
      return false;
    }
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing data:', error);
      return false;
    }
  };
  
  /**
   * Clear all application data from localStorage
   * @returns {boolean} Success status
   */
  export const clearAllData = () => {
    if (!isStorageAvailable()) {
      console.error('localStorage is not available');
      return false;
    }
    
    try {
      // Only clear our application's keys
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  };
  
  // Client-specific storage functions
  
  /**
   * Save clients to localStorage
   * @param {Array} clients - Array of client objects
   * @returns {boolean} Success status
   */
  export const saveClients = (clients) => {
    return storeData(STORAGE_KEYS.CLIENTS, clients);
  };
  
  /**
   * Get clients from localStorage
   * @returns {Array} Array of client objects or empty array if not found
   */
  export const getClients = () => {
    return retrieveData(STORAGE_KEYS.CLIENTS, []);
  };
  
  /**
   * Save a single client
   * @param {Object} client - Client object with id
   * @returns {boolean} Success status
   */
  export const saveClient = (client) => {
    if (!client || !client.id) {
      console.error('Cannot save client: Invalid client data');
      return false;
    }
    
    const clients = getClients();
    const index = clients.findIndex(c => c.id === client.id);
    
    if (index >= 0) {
      // Update existing client
      clients[index] = client;
    } else {
      // Add new client
      clients.push(client);
    }
    
    return saveClients(clients);
  };
  
  /**
   * Get a client by ID
   * @param {number|string} clientId - Client ID
   * @returns {Object|null} Client object or null if not found
   */
  export const getClientById = (clientId) => {
    const clients = getClients();
    return clients.find(client => client.id === clientId) || null;
  };
  
  /**
   * Delete a client by ID
   * @param {number|string} clientId - Client ID
   * @returns {boolean} Success status
   */
  export const deleteClient = (clientId) => {
    const clients = getClients();
    const updatedClients = clients.filter(client => client.id !== clientId);
    
    // Only save if a client was actually removed
    if (updatedClients.length < clients.length) {
      return saveClients(updatedClients);
    }
    
    return false;
  };
  
  // User preferences storage functions
  
  /**
   * Save user preferences
   * @param {Object} preferences - User preferences object
   * @returns {boolean} Success status
   */
  export const saveUserPreferences = (preferences) => {
    return storeData(STORAGE_KEYS.USER_PREFERENCES, preferences);
  };
  
  /**
   * Get user preferences
   * @returns {Object} User preferences or default preferences
   */
  export const getUserPreferences = () => {
    const defaultPreferences = {
      language: 'en',
      theme: 'light',
      notifications: true,
      autoTranslate: true,
      defaultTargetLanguage: 'en'
    };
    
    return retrieveData(STORAGE_KEYS.USER_PREFERENCES, defaultPreferences);
  };
  
  /**
   * Save language preference
   * @param {string} languageCode - Language code (e.g., 'en', 'hi')
   * @returns {boolean} Success status
   */
  export const saveLanguagePreference = (languageCode) => {
    return storeData(STORAGE_KEYS.LANGUAGE_PREFERENCE, languageCode);
  };
  
  /**
   * Get language preference
   * @returns {string} Language code or 'en' for default
   */
  export const getLanguagePreference = () => {
    return retrieveData(STORAGE_KEYS.LANGUAGE_PREFERENCE, 'en');
  };
  
  /**
   * Save conversation data
   * @param {string|number} clientId - Client ID
   * @param {Object} conversationData - Conversation data object
   * @returns {boolean} Success status
   */
  export const saveConversation = (clientId, conversationData) => {
    if (!clientId || !conversationData) {
      console.error('Cannot save conversation: Missing client ID or data');
      return false;
    }
    
    const conversations = retrieveData(STORAGE_KEYS.CONVERSATIONS, {});
    
    if (!conversations[clientId]) {
      conversations[clientId] = [];
    }
    
    // Add conversation with timestamp if not present
    const conversation = {
      ...conversationData,
      id: conversationData.id || Date.now(),
      timestamp: conversationData.timestamp || new Date().toISOString()
    };
    
    conversations[clientId].push(conversation);
    
    return storeData(STORAGE_KEYS.CONVERSATIONS, conversations);
  };
  
  /**
   * Get conversations for a client
   * @param {string|number} clientId - Client ID
   * @returns {Array} Array of conversation objects or empty array
   */
  export const getConversationsForClient = (clientId) => {
    if (!clientId) return [];
    
    const conversations = retrieveData(STORAGE_KEYS.CONVERSATIONS, {});
    return conversations[clientId] || [];
  };
  
  /**
   * Save session data (for temporary data that should persist during the session)
   * @param {Object} sessionData - Session data object
   * @returns {boolean} Success status
   */
  export const saveSessionData = (sessionData) => {
    return storeData(STORAGE_KEYS.SESSION_DATA, sessionData);
  };
  
  /**
   * Get session data
   * @returns {Object} Session data or empty object
   */
  export const getSessionData = () => {
    return retrieveData(STORAGE_KEYS.SESSION_DATA, {});
  };
  
  export default {
    // Storage basics
    storeData,
    retrieveData,
    removeData,
    clearAllData,
    
    // Client management
    saveClients,
    getClients,
    saveClient,
    getClientById,
    deleteClient,
    
    // User preferences
    saveUserPreferences,
    getUserPreferences,
    saveLanguagePreference,
    getLanguagePreference,
    
    // Conversations
    saveConversation,
    getConversationsForClient,
    
    // Session data
    saveSessionData,
    getSessionData,
    
    // Constants
    STORAGE_KEYS
  };