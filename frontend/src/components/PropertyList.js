import React, { useState, useEffect, useCallback } from 'react';
import { getProperties } from '../utils/api';
import './PropertyList.css';

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    bedrooms: '2,3',
    propertyType: '',
    city: 'New-Delhi'
  });
  const [cityStatus, setCityStatus] = useState({});
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all', 'housing', 'magicbricks'

  // Wrap fetchProperties in useCallback to prevent it from being recreated on each render
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getProperties(filters);
      
      setLoading(false);
      
      if (response.success) {
        // Filter by source if needed
        let filteredProperties = response.properties || [];
        
        if (sourceFilter === 'housing') {
          filteredProperties = filteredProperties.filter(prop => prop.source === 'Housing.com');
        } else if (sourceFilter === 'magicbricks') {
          filteredProperties = filteredProperties.filter(prop => prop.source === 'MagicBricks');
        }
        
        setProperties(filteredProperties);
        
        // Update city status to show as working
        setCityStatus(prev => ({
          ...prev,
          [filters.city]: { status: 'success', message: '' }
        }));
      } else {
        // Track the specific city that failed
        setCityStatus(prev => ({
          ...prev,
          [filters.city]: { status: 'error', message: response.message || 'Failed to fetch properties' }
        }));
        setError(response.message || `Failed to fetch properties for ${filters.city}`);
        setProperties([]);
      }
    } catch (err) {
      setLoading(false);
      console.error("Property fetch error:", err);
      setError(`Error: ${err?.message || 'Unknown error fetching properties'}`);
      // Track the specific city that failed
      setCityStatus(prev => ({
        ...prev,
        [filters.city]: { status: 'error', message: err?.message || 'Unknown error' }
      }));
      setProperties([]);
    }
  }, [filters, sourceFilter]); // Add filters and sourceFilter as dependencies

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]); // Now fetchProperties is a dependency

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSourceFilterChange = (e) => {
    setSourceFilter(e.target.value);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  // Get city label with status indicator
  const getCityLabel = (cityName, displayName) => {
    if (!cityStatus[cityName]) return displayName;
    
    if (cityStatus[cityName].status === 'success') {
      return `${displayName} ✓`;
    } else if (cityStatus[cityName].status === 'error') {
      return `${displayName} ✗`;
    }
    return displayName;
  };

  return (
    <div className="property-list-container">
      <h2>Property Listings</h2>
      
      {/* Filters Form */}
      <form className="filters-form" onSubmit={handleFilterSubmit}>
        <div className="filter-group">
          <label>City</label>
          <select name="city" value={filters.city} onChange={handleFilterChange}>
            <option value="New-Delhi">{getCityLabel('New-Delhi', 'New Delhi')}</option>
            <option value="Mumbai">{getCityLabel('Mumbai', 'Mumbai')}</option>
            <option value="Bangalore">{getCityLabel('Bangalore', 'Bangalore')}</option>
            <option value="Hyderabad">{getCityLabel('Hyderabad', 'Hyderabad')}</option>
            <option value="Pune">{getCityLabel('Pune', 'Pune')}</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Bedrooms</label>
          <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange}>
            <option value="1">1 BHK</option>
            <option value="2">2 BHK</option>
            <option value="3">3 BHK</option>
            <option value="4">4 BHK</option>
            <option value="2,3">2 & 3 BHK</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Source</label>
          <select name="source" value={sourceFilter} onChange={handleSourceFilterChange}>
            <option value="all">All Sources</option>
            <option value="housing">Housing.com</option>
            <option value="magicbricks">MagicBricks</option>
          </select>
        </div>
        
        <button type="submit" className="search-btn">Search Properties</button>
      </form>
      
      {/* Loading and Error states */}
      {loading && <div className="loading-indicator">Loading properties...</div>}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <p className="error-help">
            Try selecting a different city or refreshing the page.
            {filters.city !== 'New-Delhi' && 
              <button 
                onClick={() => {
                  setFilters(prev => ({...prev, city: 'New-Delhi'}));
                  setTimeout(fetchProperties, 100);
                }}
                className="try-delhi-btn"
              >
                Try New Delhi Instead
              </button>
            }
          </p>
        </div>
      )}
      
      {/* Property Cards */}
      <div className="property-grid">
        {properties.length === 0 && !loading && !error ? (
          <div className="no-results">No properties found matching your criteria</div>
        ) : (
          properties.map(property => (
            <div key={property.id || Math.random().toString()} className="property-card">
              <div className="property-image">
                {property.imageUrl ? (
                  <img 
                    src={property.imageUrl} 
                    alt={property.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=Property';
                    }}
                  />
                ) : (
                  <div className="placeholder-image">No Image</div>
                )}
                {property.source && (
                  <div className={`property-source ${property.source.toLowerCase().replace('.', '-')}`}>
                    {property.source}
                  </div>
                )}
              </div>
              
              <div className="property-details">
                <h3 className="property-title">{property.title || 'Property Listing'}</h3>
                <p className="property-location">{property.location || 'Location not specified'}</p>
                <div className="property-features">
                  {property.bedrooms && (
                    <span className="feature-item">{property.bedrooms} BHK</span>
                  )}
                  {property.area && (
                    <span className="feature-item">{property.area}</span>
                  )}
                </div>
                <div className="property-price">{property.price || 'Price on request'}</div>
                {property.url && (
                  <a href={property.url} target="_blank" rel="noopener noreferrer" className="view-btn">
                    View on {property.source || 'Website'}
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PropertyList;