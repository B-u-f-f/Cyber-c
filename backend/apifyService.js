// apifyService.js for backend
const { ApifyClient } = require('apify-client');

// Initialize the ApifyClient with API token from environment variables
const client = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

/**
 * Fetches property data from MagicBricks using Apify
 * @param {Object} searchParams - Search parameters like city, bedrooms, etc.
 * @returns {Promise<Object>} - Success status and property data
 */
async function startMagicBricksScraper(searchParams = {}) {
  try {
    // Default parameters
    const bedrooms = searchParams.bedrooms || '2,3';
    const propertyType = searchParams.propertyType || 'Multistorey-Apartment,Builder-Floor-Apartment,Penthouse,Studio-Apartment,Residential-House,Villa';
    const cityName = searchParams.city || 'New-Delhi';
    
    // Construct URL for MagicBricks
    const url = `https://www.magicbricks.com/property-for-sale/residential-real-estate?bedroom=${bedrooms}&proptype=${propertyType}&cityName=${cityName}`;
    
    console.log(`Starting Apify scraper for URL: ${url}`);
    
    // Create input configuration for Apify with improved settings
    const input = {
      urls: [url],
      max_items_per_url: 30,
      max_retries_per_url: 3,
      timeout_secs: 180,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"],
        apifyProxyCountry: "IN",
        apifyProxyCountryGroup: "INDIA"
      }
    };
    
    // Run the Actor and wait for it to finish
    const run = await client.actor("OGrVzUv64ImXJ1Cen").call(input);
    
    // Check if the run was successful
    const runInfo = await client.run(run.id).get();
    if (runInfo.status !== 'SUCCEEDED') {
      console.error(`Run failed with status: ${runInfo.status}`);
      return { 
        success: false, 
        error: `Scraping failed for ${cityName} with status: ${runInfo.status}`,
        runId: run.id
      };
    }
    
    // Fetch dataset items
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    // Validate that we have actually received data
    if (!items || items.length === 0) {
      console.warn(`No properties found for ${cityName}`);
      return { 
        success: true, 
        data: [],
        message: `No properties found for ${cityName}`
      };
    }
    
    console.log(`Scraping complete, fetched ${items.length} properties for ${cityName}`);
    return { success: true, data: items };
  } catch (error) {
    console.error('Apify scraper error:', error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch property data",
      details: error.stack,
      parameters: searchParams
    };
  }
}

/**
 * Fetches property data from Housing.com using Apify
 * @param {Object} searchParams - Search parameters like city, bedrooms, etc.
 * @returns {Promise<Object>} - Success status and property data
 */
async function startHousingComScraper(searchParams = {}) {
  try {
    // Get city-specific URL for Housing.com
    const cityUrlMap = {
      'New-Delhi': 'https://housing.com/in/buy/searches/P9qm7kjcs868g0ft',
      'Mumbai': 'https://housing.com/in/buy/searches/P42nyug5oyymk82z',
      'Bangalore': 'https://housing.com/in/buy/searches/Pxkz2m3xd74de75g',
      'Hyderabad': 'https://housing.com/in/buy/searches/P9j3gue07r74zvss',
      'Pune': 'https://housing.com/in/buy/searches/P4e9vqzwsyacp9cf'
    };
    
    const cityName = searchParams.city || 'New-Delhi';
    const url = cityUrlMap[cityName] || cityUrlMap['New-Delhi'];
    
    // Add additional filters to the URL if needed
    let modifiedUrl = url;
    if (searchParams.bedrooms) {
      if (searchParams.bedrooms.includes(',')) {
        modifiedUrl += `&bedrooms=${searchParams.bedrooms.split(',').join('&bedrooms=')}`;
      } else {
        modifiedUrl += `&bedrooms=${searchParams.bedrooms}`;
      }
    }
    
    console.log(`Starting Housing.com Apify scraper for URL: ${modifiedUrl}`);
    
    // Create input configuration for Apify
    const input = {
      urls: [modifiedUrl],
      max_items_per_url: 20,
      max_retries_per_url: 2,
      proxy: {
        useApifyProxy: true,
        apifyProxyGroups: ["RESIDENTIAL"],
        apifyProxyCountry: "IN"
      }
    };
    
    // Run the Actor and wait for it to finish
    const run = await client.actor("2r88Kn1xhj9HiIvR8").call(input);
    
    // Check if the run was successful
    const runInfo = await client.run(run.id).get();
    if (runInfo.status !== 'SUCCEEDED') {
      console.error(`Housing.com run failed with status: ${runInfo.status}`);
      return { 
        success: false, 
        error: `Housing.com scraping failed for ${cityName} with status: ${runInfo.status}`,
        runId: run.id
      };
    }
    
    // Fetch dataset items
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    // Validate that we have actually received data
    if (!items || items.length === 0) {
      console.warn(`No properties found on Housing.com for ${cityName}`);
      return { 
        success: true, 
        data: [],
        message: `No properties found on Housing.com for ${cityName}`
      };
    }
    
    // Transform the data to match expected format
    const transformedItems = items.map(item => ({
      id: item.id || `housing-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: item.title || 'Housing.com Property',
      price: item.price || 'Price on request',
      location: item.location || (cityName ? `${cityName}` : 'Location not specified'),
      bedrooms: item.bedrooms?.toString() || searchParams.bedrooms || 'Not specified',
      area: item.area || 'Area not specified',
      description: item.description || 'No description available',
      imageUrl: item.imageUrl || '',
      url: item.url || url,
      source: 'Housing.com'
    }));
    
    console.log(`Housing.com scraping complete, fetched ${transformedItems.length} properties for ${cityName}`);
    return { success: true, data: transformedItems };
  } catch (error) {
    console.error('Housing.com Apify scraper error:', error);
    return { 
      success: false, 
      error: error.message || "Failed to fetch Housing.com property data",
      details: error.stack,
      parameters: searchParams
    };
  }
}

/**
 * Fetches property data from both MagicBricks and Housing.com
 * @param {Object} searchParams - Search parameters
 * @returns {Promise<Object>} - Combined property data
 */
async function fetchAllProperties(searchParams = {}) {
  try {
    // Run both scrapers in parallel
    const [magicBricksResult, housingComResult] = await Promise.all([
      startMagicBricksScraper(searchParams),
      startHousingComScraper(searchParams)
    ]);
    
    // Combine the results
    const properties = [
      ...(magicBricksResult.success ? magicBricksResult.data : []),
      ...(housingComResult.success ? housingComResult.data : [])
    ];
    
    // If both failed, return error
    if (!magicBricksResult.success && !housingComResult.success) {
      return {
        success: false,
        error: `Failed to fetch properties from both sources: ${magicBricksResult.error}, ${housingComResult.error}`,
        properties: []
      };
    }
    
    return {
      success: true,
      properties,
      count: properties.length,
      sources: {
        magicBricks: {
          success: magicBricksResult.success,
          count: magicBricksResult.success ? magicBricksResult.data.length : 0
        },
        housingCom: {
          success: housingComResult.success,
          count: housingComResult.success ? housingComResult.data.length : 0
        }
      }
    };
  } catch (error) {
    console.error('Error fetching from all property sources:', error);
    return {
      success: false,
      error: error.message || "Failed to fetch property data from all sources",
      properties: []
    };
  }
}

module.exports = {
  startMagicBricksScraper,
  startHousingComScraper,
  fetchAllProperties
};