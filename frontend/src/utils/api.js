// utils/api.js
import axios from 'axios';

// Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const NEWS_API_KEY = process.env.REACT_APP_NEWS_API_KEY || "f27c0ff37bea4278b84b7bb5cf71fe48";
const APIFY_TOKEN = process.env.REACT_APP_APIFY_TOKEN;

// Axios client for backend API
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// Axios client for Apify API
const apifyClient = axios.create({
  baseURL: 'https://api.apify.com/v2',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// City to URL mapping for magicbricks.com
const magicbricksCityUrlMap = {
  'New-Delhi': 'https://www.magicbricks.com/property-for-sale/residential-real-estate?bedroom=2,3&proptype=Multistorey-Apartment,Builder-Floor-Apartment,Penthouse,Studio-Apartment&cityName=New-Delhi',
  'Mumbai': 'https://www.magicbricks.com/property-for-sale/residential-real-estate?bedroom=2,3&proptype=Multistorey-Apartment,Builder-Floor-Apartment,Penthouse,Studio-Apartment&cityName=Mumbai',
  'Bangalore': 'https://www.magicbricks.com/property-for-sale/residential-real-estate?bedroom=2,3&proptype=Multistorey-Apartment,Builder-Floor-Apartment,Penthouse,Studio-Apartment&cityName=Bangalore',
  'Hyderabad': 'https://www.magicbricks.com/property-for-sale/residential-real-estate?bedroom=2,3&proptype=Multistorey-Apartment,Builder-Floor-Apartment,Penthouse,Studio-Apartment&cityName=Hyderabad',
  'Pune': 'https://www.magicbricks.com/property-for-sale/residential-real-estate?bedroom=2,3&proptype=Multistorey-Apartment,Builder-Floor-Apartment,Penthouse,Studio-Apartment&cityName=Pune'
};

// City to URL mapping for housing.com
const housingCityUrlMap = {
  'New-Delhi': 'https://housing.com/in/buy/searches/P9qm7kjcs868g0ft',
  'Mumbai': 'https://housing.com/in/buy/searches/P42nyug5oyymk82z',
  'Bangalore': 'https://housing.com/in/buy/searches/Pxkz2m3xd74de75g',
  'Hyderabad': 'https://housing.com/in/buy/searches/P9j3gue07r74zvss',
  'Pune': 'https://housing.com/in/buy/searches/P4e9vqzwsyacp9cf'
};

// Apify Actor IDs
const ACTOR_IDS = {
  HOUSING: "2r88Kn1xhj9HiIvR8",   // Housing.com actor
  MAGICBRICKS: "OGrVzUv64ImXJ1Cen" // MagicBricks actor
};

/**
 * Local Storage Cache Management
 * These functions help store and retrieve property data locally
 */

// Save data to local storage
const saveToLocalStorage = (key, data, expiryTimeInMinutes = 60) => {
  try {
    const item = {
      data: data,
      timestamp: new Date().getTime(),
      expiry: new Date().getTime() + (expiryTimeInMinutes * 60 * 1000)
    };
    localStorage.setItem(key, JSON.stringify(item));
    console.log(`Saved data to local storage with key: ${key}`);
    return true;
  } catch (error) {
    console.error('Error saving to local storage:', error);
    return false;
  }
};

// Get data from local storage
const getFromLocalStorage = (key) => {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    const now = new Date().getTime();
    
    // Check if the item has expired
    if (now > item.expiry) {
      localStorage.removeItem(key);
      console.log(`Cache expired for key: ${key}`);
      return null;
    }
    
    console.log(`Retrieved data from local storage with key: ${key}`);
    return item.data;
  } catch (error) {
    console.error('Error retrieving from local storage:', error);
    return null;
  }
};

// Generate cache key based on filters
const generateCacheKey = (filters = {}, source = 'all') => {
  const city = filters.city || 'New-Delhi';
  const bedrooms = filters.bedrooms || '2,3';
  const propertyType = filters.propertyType || '';
  return `properties_${source}_${city}_${bedrooms}_${propertyType}`;
};

/**
 * Handle API errors
 * @param {Object} error - The error object
 * @returns {Object} - Error details
 */
const handleApiError = (error) => {
  if (error.response) {
    console.error("API Error Response:", error.response.data);
    return {
      error: true,
      message: error.response.data.error || "Server error",
      status: error.response.status,
      details: error.response.data.details || {}
    };
  } else if (error.request) {
    console.error("API No Response:", error.request);
    return {
      error: true,
      message: "No response from server. Please check if the backend server is running.",
      status: 0
    };
  } else {
    console.error("API Request Error:", error.message);
    return {
      error: true,
      message: "Failed to send request: " + error.message,
      status: 0
    };
  }
};

/**
 * Run an Apify actor using axios
 * @param {string} actorId - The ID of the Apify actor to run
 * @param {Object} input - The input for the actor
 * @returns {Promise<Object>} The actor run results
 */
const runApifyActor = async (actorId, input) => {
  try {
    console.log(`Starting Apify actor ${actorId} with input:`, input);
    
    // Start the actor run
    const runResponse = await apifyClient.post(`/acts/${actorId}/runs`, input, {
      params: {
        token: APIFY_TOKEN
      }
    });
    
    const runId = runResponse.data.data.id;
    console.log(`Actor run started with ID: ${runId}`);
    
    // Poll until the run is finished
    let isFinished = false;
    let runData;
    let pollCount = 0;
    const maxPolls = 30; // Maximum number of polls to prevent infinite loops
    
    while (!isFinished && pollCount < maxPolls) {
      // Wait for 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
      pollCount++;
      
      // Check run status
      const statusResponse = await apifyClient.get(`/acts/${actorId}/runs/${runId}`, {
        params: {
          token: APIFY_TOKEN
        }
      });
      
      runData = statusResponse.data.data;
      console.log(`Poll ${pollCount}: Actor run status: ${runData.status}`);
      isFinished = ['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(runData.status);
    }
    
    // If polling reached max limit but run is not finished
    if (!isFinished) {
      throw new Error(`Actor run taking too long (exceeded ${maxPolls} polls). Please try again later.`);
    }
    
    // If run finished successfully, get the dataset items
    if (runData.status === 'SUCCEEDED') {
      const datasetId = runData.defaultDatasetId;
      console.log(`Actor run succeeded. Fetching data from dataset: ${datasetId}`);
      
      const itemsResponse = await apifyClient.get(`/datasets/${datasetId}/items`, {
        params: {
          token: APIFY_TOKEN,
          format: 'json'
        }
      });
      
      console.log(`Retrieved ${itemsResponse.data.length} items from dataset`);
      return itemsResponse.data;
    } else {
      throw new Error(`Actor run failed with status: ${runData.status}`);
    }
  } catch (error) {
    console.error(`Error running Apify actor ${actorId}:`, error);
    throw error;
  }
};

/**
 * Fetch properties from Housing.com using axios (with memory-efficient settings)
 * @param {Object} filters - Filter criteria for properties
 * @returns {Promise<Object>} Properties data
 */
export const getHousingProperties = async (filters = {}) => {
  // Generate cache key for this specific request
  const cacheKey = generateCacheKey(filters, 'housing');
  
  // Try to get data from local storage first
  const cachedData = getFromLocalStorage(cacheKey);
  if (cachedData) {
    console.log('Using cached Housing.com data');
    return {
      success: true,
      message: 'Data retrieved from local cache',
      properties: cachedData
    };
  }
  
  try {
    // Get the URL for the selected city or default to New Delhi
    const cityUrl = filters.city ? housingCityUrlMap[filters.city] : housingCityUrlMap['New-Delhi'];
    
    if (!cityUrl) {
      return {
        success: false,
        message: `City ${filters.city} is not supported for Housing.com`,
        properties: []
      };
    }
    
    // Prepare Actor input with memory-efficient settings
    const input = {
      "urls": [cityUrl],
      "max_items_per_url": 5, // Reduced to prevent memory issues
      "max_retries_per_url": 2,
      "memory_mbytes": 512, // Request smaller memory allocation
      "proxy": {
        "useApifyProxy": true,
        "apifyProxyGroups": ["RESIDENTIAL"],
        "apifyProxyCountry": "US"
      }
    };
    
    // Add filters to the URL if present
    let modifiedUrl = input.urls[0];
    
    if (filters.bedrooms) {
      if (filters.bedrooms.includes(',')) {
        modifiedUrl += `&bedrooms=${filters.bedrooms.split(',').join('&bedrooms=')}`;
      } else {
        modifiedUrl += `&bedrooms=${filters.bedrooms}`;
      }
    }
    
    if (filters.propertyType) {
      modifiedUrl += `&propertyType=${filters.propertyType}`;
    }
    
    input.urls[0] = modifiedUrl;
    
    try {
      // Run the Actor and wait for it to finish
      const items = await runApifyActor(ACTOR_IDS.HOUSING, input);
      
      // Transform the data to match your expected property format
      const properties = items.map(item => ({
        id: item.id || `housing-${Math.random().toString(36).substr(2, 9)}`,
        title: item.title || 'Housing.com Property',
        location: item.location || `${filters.city || 'Unknown'} Location`,
        bedrooms: item.bedrooms || filters.bedrooms || 'Unknown',
        area: item.area || 'Area not specified',
        price: item.price || 'Price on request',
        imageUrl: item.imageUrl || '',
        url: item.url || cityUrl,
        source: 'Housing.com'
      }));
      
      // Save the successful results to local storage
      saveToLocalStorage(cacheKey, properties, 120); // Cache for 2 hours
      
      return {
        success: true,
        message: '',
        properties
      };
    } catch (apifyError) {
      console.error('Failed to fetch from Housing.com Apify actor:', apifyError);
      
      // Try fetching from backend as fallback
      try {
        console.log('Attempting to fetch Housing.com data from backend...');
        const backendResponse = await apiClient.get('/api/properties', { 
          params: {
            ...filters,
            source: 'housing'
          }
        });
        
        if (backendResponse.data.success && backendResponse.data.properties) {
          // Save the successful results to local storage
          saveToLocalStorage(cacheKey, backendResponse.data.properties, 120); // Cache for 2 hours
          
          return {
            success: true,
            message: 'Data fetched from backend',
            properties: backendResponse.data.properties
          };
        }
        throw new Error('Backend failed to provide valid data');
      } catch (backendError) {
        console.error('Backend fetch also failed:', backendError);
        throw apifyError; // Throw the original error
      }
    }
  } catch (error) {
    console.error('Error fetching Housing.com properties:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch Housing.com properties',
      properties: []
    };
  }
};

/**
 * Fetch properties from MagicBricks using axios
 * @param {Object} filters - Filter criteria for properties
 * @returns {Promise<Object>} Properties data
 */
export const getMagicBricksProperties = async (filters = {}) => {
  // Generate cache key for this specific request
  const cacheKey = generateCacheKey(filters, 'magicbricks');
  
  // Try to get data from local storage first
  const cachedData = getFromLocalStorage(cacheKey);
  if (cachedData) {
    console.log('Using cached MagicBricks data');
    return {
      success: true,
      message: 'Data retrieved from local cache',
      properties: cachedData
    };
  }
  
  try {
    // Get the URL for the selected city or default to New Delhi
    const cityUrl = filters.city ? magicbricksCityUrlMap[filters.city] : magicbricksCityUrlMap['New-Delhi'];
    
    if (!cityUrl) {
      return {
        success: false,
        message: `City ${filters.city} is not supported for MagicBricks`,
        properties: []
      };
    }
    
    // Prepare Actor input
    const input = {
      "urls": [cityUrl],
      "max_retries_per_url": 2,
      "proxy": {
        "useApifyProxy": true,
        "apifyProxyGroups": ["RESIDENTIAL"],
        "apifyProxyCountry": "US"
      }
    };
    
    // Modify URL for bedrooms if needed
    let modifiedUrl = input.urls[0];
    
    if (filters.bedrooms && !modifiedUrl.includes('bedroom=')) {
      modifiedUrl = modifiedUrl.replace('bedroom=2,3', `bedroom=${filters.bedrooms}`);
    }
    
    input.urls[0] = modifiedUrl;
    
    try {
      // Run the Actor and wait for it to finish
      const items = await runApifyActor(ACTOR_IDS.MAGICBRICKS, input);
      
      // Transform the data to match your expected property format
      const properties = items.map(item => ({
        id: item.id || `magicbricks-${Math.random().toString(36).substr(2, 9)}`,
        title: item.name || item.title || 'MagicBricks Property',
        location: item.locality || item.address || `${filters.city || 'Unknown'} Location`,
        bedrooms: item.bedrooms || filters.bedrooms || 'Unknown',
        area: item.area || `${item.covered_area || item.carpet_area || ''} ${item.cov_area_unit || item.carp_area_unit || 'sq.ft.'}`,
        price: item.price_display_value || (item.price ? `₹${item.price.toLocaleString()}` : 'Price on request'),
        imageUrl: item.imageUrl || item.image_url || '',
        url: item.propertyUrl || item.url || cityUrl,
        source: 'MagicBricks'
      }));
      
      // Save the successful results to local storage
      saveToLocalStorage(cacheKey, properties, 120); // Cache for 2 hours
      
      return {
        success: true,
        message: '',
        properties
      };
    } catch (apifyError) {
      console.error('Failed to fetch from MagicBricks Apify actor:', apifyError);
      
      // Try fetching from backend as fallback
      try {
        console.log('Attempting to fetch MagicBricks data from backend...');
        const backendResponse = await apiClient.get('/api/properties', { 
          params: {
            ...filters,
            source: 'magicbricks'
          }
        });
        
        if (backendResponse.data.success && backendResponse.data.properties) {
          // Save the successful results to local storage
          saveToLocalStorage(cacheKey, backendResponse.data.properties, 120); // Cache for 2 hours
          
          return {
            success: true,
            message: 'Data fetched from backend',
            properties: backendResponse.data.properties
          };
        }
        throw new Error('Backend failed to provide valid data');
      } catch (backendError) {
        console.error('Backend fetch also failed:', backendError);
        throw apifyError; // Throw the original error
      }
    }
  } catch (error) {
    console.error('Error fetching MagicBricks properties:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch MagicBricks properties',
      properties: []
    };
  }
};

/**
 * Fetch properties from both sources or fallback to local storage
 * @param {Object} filters - Filter criteria for properties
 * @returns {Promise<Object>} Combined properties data
 */
export const getProperties = async (filters = {}) => {
  // Generate cache key for combined data
  const cacheKey = generateCacheKey(filters, 'all');
  
  // Check if we've already made this query
  const cachedData = getFromLocalStorage(cacheKey);
  if (cachedData) {
    console.log('Using cached combined property data');
    return {
      success: true,
      message: 'Data retrieved from local cache',
      properties: cachedData
    };
  }
  
  try {
    // First try to fetch from backend
    try {
      console.log(`Attempting to fetch properties from backend: ${API_BASE_URL}/api/properties`);
      
      // Prepare query parameters
      const params = {
        bedrooms: filters.bedrooms || '2,3',
        propertyType: filters.propertyType || '',
        city: filters.city || 'New-Delhi'
      };
      
      // Add source filter if present
      if (filters.source === 'housing' || filters.source === 'magicbricks') {
        params.source = filters.source;
      }
      
      const response = await apiClient.get('/api/properties', { params });
      
      // Check if response has the expected structure
      if (response.data && response.data.success !== false && response.data.properties) {
        console.log(`Successfully fetched ${response.data.properties.length} properties from backend`);
        
        // Save to cache
        saveToLocalStorage(cacheKey, response.data.properties, 120); // Cache for 2 hours
        
        return {
          success: true,
          message: response.data.message || '',
          properties: response.data.properties
        };
      }
      
      console.warn('Backend returned unexpected data structure:', response.data);
      throw new Error('Backend API returned unexpected data structure');
    } catch (backendError) {
      console.warn('Backend fetch failed, trying direct API calls...', backendError);
      // Continue with direct API calls
    }
    
    // If backend failed, try direct API calls
    const promises = [];
    
    if (!filters.source || filters.source === 'all' || filters.source === 'housing') {
      promises.push(getHousingProperties(filters));
    }
    
    if (!filters.source || filters.source === 'all' || filters.source === 'magicbricks') {
      promises.push(getMagicBricksProperties(filters));
    }
    
    // Fetch properties from all sources in parallel
    const results = await Promise.all(promises);
    
    // Combine properties from all successful sources
    const combinedProperties = results.reduce((acc, result) => {
      if (result.success && result.properties) {
        return [...acc, ...result.properties];
      }
      return acc;
    }, []);
    
    // If no properties found from any source
    if (combinedProperties.length === 0) {
      return {
        success: true,
        message: 'No properties found matching your criteria',
        properties: []
      };
    }
    
    // Save the combined results to local storage
    saveToLocalStorage(cacheKey, combinedProperties, 120); // Cache for 2 hours
    
    // Successful fetch with properties
    return {
      success: true,
      message: '',
      properties: combinedProperties
    };
  } catch (error) {
    console.error('Error fetching properties:', error);
    return {
      success: false,
      message: error.message || 'Failed to fetch properties',
      properties: []
    };
  }
};

/**
 * Clear cached property data
 * @param {string} city - Optional city to clear cache for specific city only
 * @returns {boolean} Success status
 */
export const clearPropertyCache = (city = null) => {
  try {
    if (city) {
      // Clear cache for specific city only
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(`properties_`) && key.includes(`_${city}_`)) {
          keys.push(key);
        }
      }
      
      keys.forEach(key => localStorage.removeItem(key));
      console.log(`Cleared property cache for ${city}: ${keys.length} items removed`);
    } else {
      // Clear all property cache
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('properties_')) {
          keys.push(key);
        }
      }
      
      keys.forEach(key => localStorage.removeItem(key));
      console.log(`Cleared all property cache: ${keys.length} items removed`);
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing property cache:', error);
    return false;
  }
};

/**
 * Fetch real estate news from NewsAPI
 * @param {number} pageSize - Number of news items to fetch
 * @returns {Promise<Object>} News data
 */
export const getRealEstateNews = async (pageSize = 5) => {
  // Try to get news from cache first
  const cacheKey = `news_${pageSize}`;
  const cachedNews = getFromLocalStorage(cacheKey);
  
  if (cachedNews) {
    console.log('Using cached news data');
    return { success: true, data: cachedNews };
  }
  
  try {
    console.log('Fetching real estate news...');
    const query = "real estate OR property market OR housing India";
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        apiKey: NEWS_API_KEY,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: pageSize
      }
    });
    if (response.data && response.data.articles) {
      console.log(`Fetched ${response.data.articles.length} news articles`);
      
      // Save to cache (short expiry since news changes frequently)
      saveToLocalStorage(cacheKey, response.data.articles, 60); // Cache for 1 hour
      
      return { success: true, data: response.data.articles };
    } else {
      console.error('Invalid news response structure:', response.data);
      return { success: false, message: 'Invalid response from News API' };
    }
  } catch (error) {
    console.error('News API error:', error);
    if (error.response && error.response.status === 429) {
      return { success: false, message: 'News API rate limit exceeded. Please try again later.' };
    }
    if (error.response && error.response.status === 401) {
      return { success: false, message: 'News API authentication failed. Please check your API key.' };
    }
    return { success: false, message: error.message || 'Failed to fetch news' };
  }
};

/**
 * Send a chat message to the backend chatbot
 * @param {string} prompt - The user's message
 * @param {string} sourceLanguage - Source language for translation
 * @param {string} targetLanguage - Target language for translation
 * @returns {Promise<Object>} Chatbot response
 */
export const sendChatMessage = async (prompt, sourceLanguage, targetLanguage) => {
  try {
    console.log(`Sending chat request to ${API_BASE_URL}/chatbot`);
    const response = await apiClient.post('/chatbot', { prompt, sourceLanguage, targetLanguage });
    return response.data;
  } catch (error) {
    console.error("Chat request failed:", error);
    return handleApiError(error);
  }
};

/**
 * Check server connection
 * @returns {Promise<boolean>} True if server is reachable, false otherwise
 */
export const checkServerConnection = async () => {
  try {
    console.log(`Checking server connection at ${API_BASE_URL}/health`);
    await axios.get(`${API_BASE_URL}/health`, { timeout: 5000, withCredentials: true });
    console.log("Server connection successful");
    return true;
  } catch (error) {
    console.error("Server connection check failed:", error);
    return false;
  }
};

// Create a named export object to fix ESLint warning
const apiService = {
  getProperties,
  getHousingProperties,
  getMagicBricksProperties,
  getRealEstateNews,
  sendChatMessage,
  checkServerConnection,
  clearPropertyCache // Added for cache management
};

export default apiService;