const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
require("dotenv").config();


const connectDB = require('./db');


const { startMagicBricksScraper, startHousingComScraper, fetchAllProperties } = require('./apifyService');

const app = express();
const PORT = process.env.PORT || 5000;


connectDB();


app.use(cors({
  origin: [
    "http://localhost:3000",  
    "http://localhost:3001",  
    "http://localhost:3002",  
    "http://localhost:5000"   
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, 
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests, please try again later"
});
app.use(limiter);


const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY || "b6b429b14ef94aa5a081cdf35d612088";


app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));


app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "up",
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

/**
 * Translate text using MyMemory Translation API (Free)
 * @param {string} text - Text to translate
 * @param {string} sourceLanguage - Source language code (e.g., 'en')
 * @param {string} targetLanguage - Target language code (e.g., 'hi')
 * @returns {Promise<string>} - Translated text
 */
const translateWithMyMemory = async (text, sourceLanguage, targetLanguage) => {
  try {
    const langPair = `${sourceLanguage}|${targetLanguage}`;
    console.log(`Translating with MyMemory: ${langPair}`);
    
    const response = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: text,
        langpair: langPair,
        de: 'realestate@example.com' // Replace with your email
      },
      timeout: 10000
    });
    
    if (response.data && response.data.responseData && response.data.responseData.translatedText) {
      console.log(`Translation successful: ${response.data.responseStatus}`);
      return response.data.responseData.translatedText;
    } else {
      console.error('Invalid response structure from MyMemory API:', response.data);
      throw new Error('Invalid response structure from MyMemory API');
    }
  } catch (error) {
    console.error('MyMemory Translation error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

// Attempt translation with MyMemory (primary) and fallback to LibreTranslate if available
async function attemptTranslation(text, sourceLanguage, targetLanguage) {
  // First try with MyMemory (more reliable)
  try {
    console.log(`Attempting translation with MyMemory API: ${sourceLanguage} -> ${targetLanguage}`);
    return await translateWithMyMemory(text, sourceLanguage, targetLanguage);
  } catch (myMemoryError) {
    console.error(`MyMemory translation failed:`, myMemoryError.message);
    
    // Fallback to LibreTranslate if defined
    if (process.env.LIBRETRANSLATE_URL) {
      try {
        console.log(`Falling back to LibreTranslate: ${process.env.LIBRETRANSLATE_URL}`);
        const response = await axios.post(
          process.env.LIBRETRANSLATE_URL,
          {
            q: text,
            source: sourceLanguage || "en",
            target: targetLanguage
          },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 10000
          }
        );
        return response.data.translatedText;
      } catch (libreError) {
        console.error(`LibreTranslate fallback also failed:`, libreError.message);
      }
    }
    
    // If all translation attempts fail, throw error
    throw new Error("All translation services unavailable");
  }
}

app.post("/chatbot", async (req, res) => {
  const { prompt, targetLanguage } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Generate response using Gemini AI
    const enhancedPrompt = `Provide a response in ${targetLanguage} for: ${prompt}`;
    const result = await model.generateContent(enhancedPrompt);
    const response = result.response.text();

    res.json({ reply: response });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Failed to generate response" });
  }
});


// Cache for property data to avoid frequent API calls
let propertyCache = {
  timestamp: null,
  data: null,
  expiresIn: 60 * 60 * 1000, // 1 hour in milliseconds
};

// Get property listings from both MagicBricks and Housing.com
app.get('/api/properties', async (req, res) => {
  try {
    const now = Date.now();
    
    // Extract search parameters from request
    const searchParams = {
      bedrooms: req.query.bedrooms || '2,3',
      propertyType: req.query.propertyType || 'Multistorey-Apartment,Builder-Floor-Apartment,Penthouse,Studio-Apartment,Residential-House,Villa',
      city: req.query.city || 'New-Delhi',
      source: req.query.source || 'all' // 'all', 'magicbricks', or 'housing'
    };
    
    // Generate cache key based on all search parameters to ensure proper caching
    const cacheKey = `${searchParams.source}-${searchParams.city}-${searchParams.bedrooms}-${searchParams.propertyType}`;
    
    // Check if we have valid cache for these specific parameters
    if (propertyCache.data && 
        propertyCache.timestamp && 
        propertyCache.cacheKey === cacheKey &&
        (now - propertyCache.timestamp < propertyCache.expiresIn)) {
      console.log(`Returning cached property data for ${cacheKey}`);
      return res.json(propertyCache.data);
    }
    
    console.log(`Fetching properties with parameters:`, searchParams);
    
    let result;
    
    // Call appropriate Apify service based on source
    if (searchParams.source === 'magicbricks') {
      result = await startMagicBricksScraper(searchParams);
    } else if (searchParams.source === 'housing') {
      result = await startHousingComScraper(searchParams);
    } else {
      // Fetch from both sources
      result = await fetchAllProperties(searchParams);
    }
    
    if (!result.success) {
      console.error(`Error from Apify service for ${searchParams.city}:`, result.error);
      return res.status(500).json({ 
        success: false,
        error: `Failed to fetch properties from ${searchParams.city}`,
        details: result.error,
        message: `We're currently experiencing difficulties fetching properties in ${searchParams.city}. Please try again later or try a different city.`
      });
    }
    
    // Check if we got empty results
    const properties = result.properties || result.data || [];
    if (properties.length === 0) {
      console.log(`No properties found for ${searchParams.city}`);
      return res.json({
        success: true,
        properties: [],
        message: `No properties found matching your criteria in ${searchParams.city}`
      });
    }
    
    // Standardize the property data format if needed
    const standardizedProperties = properties.map(item => {
      // If it's already in our standard format, return as is
      if (item.source) {
        return item;
      }
      
      // Otherwise, transform to standard format (for MagicBricks data)
      return {
        id: item.id || `mb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: item.name || item.title || 'Property Listing',
        price: item.price_display_value || (item.price ? `₹${item.price.toLocaleString()}` : 'Price on request'),
        location: item.address || item.location || (item.city_name ? `${item.city_name}` : 'Location not specified'),
        bedrooms: item.bedrooms?.toString() || searchParams.bedrooms || 'Not specified',
        bathrooms: item.bathrooms?.toString() || 'Not specified',
        area: item.area || `${item.covered_area || item.carpet_area || ''} ${item.cov_area_unit || item.carp_area_unit || 'sq.ft.'}`,
        description: item.description || item.seo_description || 'No description available',
        imageUrl: item.imageUrl || item.image_url || '',
        url: item.url ? (item.url.startsWith('http') ? item.url : `https://www.magicbricks.com/${item.url}`) : '',
        landmark: item.landmark || '',
        ownerName: item.owner_name || '',
        postedDate: item.posted_date ? new Date(item.posted_date).toLocaleDateString() : '',
        source: item.source || 'MagicBricks'
      };
    });
    
    const responseData = { 
      success: true,
      properties: standardizedProperties,
      city: searchParams.city,
      source: searchParams.source,
      count: standardizedProperties.length
    };
    
    // Update cache with the new key
    propertyCache = {
      timestamp: now,
      data: responseData,
      cacheKey: cacheKey,
      expiresIn: 30 * 60 * 1000 // 30 minutes
    };
    
    console.log(`Returning ${standardizedProperties.length} properties for ${searchParams.city}`);
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch properties',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Live Translation Route - Updated to use MyMemory and handle both text and audio
app.post("/live-translate", async (req, res) => {
  const { text, audioUrl, sourceLanguage, targetLanguage } = req.body;

  if ((!text && !audioUrl) || !targetLanguage) {
    return res.status(400).json({ error: "Either text or audioUrl must be provided, along with targetLanguage" });
  }

  try {
    let transcriptionText = '';
    
    if (audioUrl) {
      // Handle as audio URL for transcription
      // Step 1: Start Real-Time Transcription
      const transcriptionResponse = await axios.post(
        "https://api.assemblyai.com/v2/transcript",
        {
          audio_url: audioUrl,
          language_code: sourceLanguage || "en" // Use provided source language or default to English
        },
        {
          headers: {
            authorization: ASSEMBLYAI_API_KEY,
            "Content-Type": "application/json"
          },
        }
      );

      const transcriptId = transcriptionResponse.data.id;

      // Step 2: Poll for Transcription Result
      let transcript;
      while (true) {
        const checkResponse = await axios.get(
          `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
          {
            headers: {
              authorization: ASSEMBLYAI_API_KEY,
              "Content-Type": "application/json"
            },
          }
        );

        transcript = checkResponse.data;
        if (transcript.status === "completed") break;
        if (transcript.status === "failed") {
          throw new Error("Transcription failed");
        }

        // Wait 3 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
      
      transcriptionText = transcript.text;
    } else {
      // Handle as direct text input (no transcription needed)
      transcriptionText = text;
    }

    // Step 3: Translate the text using our new translation function
    const translatedText = await attemptTranslation(transcriptionText, sourceLanguage || "en", targetLanguage);

    // Step 4: Return the Translated Text
    res.json({
      transcription: transcriptionText,
      translation: translatedText,
      targetLanguage
    });
  } catch (error) {
    console.error("Live translation error:", error);
    res.status(500).json({
      error: "Failed to perform live translation",
      details: error.message
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check available at http://localhost:${PORT}/health`);
  console.log(`👤 Auth endpoints available at http://localhost:${PORT}/api/auth`);
  console.log(`👥 Client management available at http://localhost:${PORT}/api/clients`);
});