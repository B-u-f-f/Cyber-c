

const { ApifyClient } = require('apify-client');
require('dotenv').config();


const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});


let propertyCache = {
  timestamp: null,
  data: null,
  cacheKey: null,
  expiresIn: 30 * 60 * 1000 
};

async function startMagicBricksScraper(searchParams) {
  try {
    console.log('Starting MagicBricks scraper with params:', searchParams);
    

    const url = `https://www.magicbricks.com/property-for-sale/residential-real-estate?bedroom=${searchParams.bedrooms}&proptype=${searchParams.propertyType}&cityName=${searchParams.city}`;
    

    const input = {
      "urls": [url],
      "max_items_per_url": 30,
      "max_retries_per_url": 2,
      "proxy": {
        "useApifyProxy": true,
        "apifyProxyGroups": ["RESIDENTIAL"],
        "apifyProxyCountry": "US"
      }
    };

    const run = await apifyClient.actor("OGrVzUv64ImXJ1Cen").call(input);

    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    return {
      success: true,
      data: items
    };
  } catch (error) {
    console.error('MagicBricks scraper error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch data from MagicBricks'
    };
  }
}


async function startHousingComScraper(searchParams) {
  try {
    console.log('Starting Housing.com scraper with params:', searchParams);
   
    const locationParam = searchParams.city.replace('-', '_').toLowerCase();

    const url = `https://housing.com/in/buy/projects/${locationParam}`;
    

    const input = {
      "urls": [url],
      "max_items_per_url": 20,
      "max_retries_per_url": 2,
      "proxy": {
        "useApifyProxy": false
      }
    };

    const run = await apifyClient.actor("2r88Kn1xhj9HiIvR8").call(input);
    
    const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    const properties = items.map(item => ({
      ...item,
      source: 'Housing.com'
    }));
    
    return {
      success: true,
      data: properties
    };
  } catch (error) {
    console.error('Housing.com scraper error:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch data from Housing.com'
    };
  }
}


async function fetchAllProperties(searchParams) {
  try {
    console.log('Fetching properties from all sources');
    

    const [magicBricksResult, housingResult] = await Promise.allSettled([
      startMagicBricksScraper(searchParams),
      startHousingComScraper(searchParams)
    ]);
    

    const properties = [];
    
    if (magicBricksResult.status === 'fulfilled' && magicBricksResult.value.success) {
  
      const mbProperties = magicBricksResult.value.data.map(item => ({
        ...item,
        source: item.source || 'MagicBricks'
      }));
      properties.push(...mbProperties);
    }
    
    if (housingResult.status === 'fulfilled' && housingResult.value.success) {
      properties.push(...housingResult.value.data);
    }
    

    if (properties.length === 0) {
      return {
        success: false,
        error: 'Failed to fetch properties from any source'
      };
    }
    
    return {
      success: true,
      properties
    };
  } catch (error) {
    console.error('Error fetching from all sources:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch properties'
    };
  }
}

module.exports = {
  startMagicBricksScraper,
  startHousingComScraper,
  fetchAllProperties,
  propertyCache
};