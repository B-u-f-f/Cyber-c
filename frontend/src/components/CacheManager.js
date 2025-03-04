import React, { useState, useEffect } from 'react';
import { clearPropertyCache } from '../utils/api';

const CacheManager = () => {
  const [cacheInfo, setCacheInfo] = useState({
    cacheCount: 0,
    cacheSize: 0,
    cacheCities: []
  });
  const [clearStatus, setClearStatus] = useState({
    message: '',
    error: false
  });

  // Function to analyze cache
  const analyzeCacheData = () => {
    try {
      let totalSize = 0;
      let count = 0;
      const cities = new Set();

      // Loop through all localStorage items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('properties_')) {
          const value = localStorage.getItem(key);
          if (value) {
            // Add to size (in KB)
            totalSize += (value.length * 2) / 1024;
            count++;

            // Extract city from key (format: properties_source_city_bedrooms_propertyType)
            const parts = key.split('_');
            if (parts.length >= 3) {
              cities.add(parts[2]);
            }
          }
        }
      }

      setCacheInfo({
        cacheCount: count,
        cacheSize: totalSize.toFixed(2),
        cacheCities: Array.from(cities)
      });
    } catch (error) {
      console.error('Error analyzing cache:', error);
    }
  };

  // Analyze cache on component mount
  useEffect(() => {
    analyzeCacheData();
  }, []);

  // Handle clearing all cache
  const handleClearAll = () => {
    try {
      const success = clearPropertyCache();
      if (success) {
        setClearStatus({
          message: 'All property cache cleared successfully!',
          error: false
        });
        analyzeCacheData(); // Refresh stats
      } else {
        setClearStatus({
          message: 'Failed to clear cache. Please try again.',
          error: true
        });
      }
    } catch (error) {
      setClearStatus({
        message: `Error: ${error.message}`,
        error: true
      });
    }
  };

  // Handle clearing cache for a specific city
  const handleClearCity = (city) => {
    try {
      const success = clearPropertyCache(city);
      if (success) {
        setClearStatus({
          message: `Cache for ${city} cleared successfully!`,
          error: false
        });
        analyzeCacheData(); // Refresh stats
      } else {
        setClearStatus({
          message: `Failed to clear cache for ${city}. Please try again.`,
          error: true
        });
      }
    } catch (error) {
      setClearStatus({
        message: `Error: ${error.message}`,
        error: true
      });
    }
  };

  return (
    <div className="cache-manager">
      <h3>Property Data Cache Manager</h3>
      
      <div className="cache-stats">
        <div className="stat-item">
          <span className="stat-label">Cache Items:</span>
          <span className="stat-value">{cacheInfo.cacheCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Cache Size:</span>
          <span className="stat-value">{cacheInfo.cacheSize} KB</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Cached Cities:</span>
          <span className="stat-value">{cacheInfo.cacheCities.join(', ') || 'None'}</span>
        </div>
      </div>
      
      {clearStatus.message && (
        <div className={`status-message ${clearStatus.error ? 'error' : 'success'}`}>
          {clearStatus.message}
        </div>
      )}
      
      <div className="cache-actions">
        <button 
          className="clear-all-btn"
          onClick={handleClearAll}
          disabled={cacheInfo.cacheCount === 0}
        >
          Clear All Cache
        </button>
        
        {cacheInfo.cacheCities.length > 0 && (
          <div className="city-cache-actions">
            <h4>Clear cache for specific city:</h4>
            <div className="city-buttons">
              {cacheInfo.cacheCities.map(city => (
                <button 
                  key={city} 
                  className="clear-city-btn"
                  onClick={() => handleClearCity(city)}
                >
                  Clear {city}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="cache-info">
        <h4>About Property Cache</h4>
        <p>
          Property data is stored locally in your browser to improve performance and reduce API usage.
          Cache expires automatically after 2 hours, but you can manually clear it using the buttons above.
        </p>
        <p>
          Clearing the cache will force the application to fetch fresh data from the servers on the next request.
        </p>
      </div>
    </div>
  );
};

export default CacheManager;