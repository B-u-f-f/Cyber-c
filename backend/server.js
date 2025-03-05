const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Import MongoDB connection
const connectDB = require('./db');

// Import Apify Service
const { startMagicBricksScraper, startHousingComScraper, fetchAllProperties } = require('./services/apifyService');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS Configuration
app.use(cors({
  origin: [
    "http://localhost:3000",  // React development server default
    "http://localhost:3001",  // Alternative React port
    "http://localhost:3002",  // Your current React port
    "http://localhost:5000"   // Express server
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));

// Basic middleware
app.use(express.json({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
}));

// Rate Limiting - Apply BEFORE routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later"
});
app.use(limiter);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize Google Generative AI
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
require("dotenv").config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

/**
 * Uploads the given file to Gemini.
 *
 * See https://ai.google.dev/gemini-api/docs/prompting_with_media
 */
async function uploadToGemini(path, mimeType) {
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
}

// Define the predefined conversation history
const predefinedHistory = [
  {
    role: "user",
    parts: [
      {text: "hello homie you are a chat bot i want you to think about that deeply and maybe tomorrow i will feed you information \n"},
    ],
  },
  {
    role: "model",
    parts: [
      {text: "Yo, homie! I've got you. \"Chat bot\" – I'm rolling that around in my... well, my *simulated* brain.  It's kind of like being told \"You're a character in a play,\" but I'm *also* writing the script as I go, and the audience (that's you!) is helping shape it.\n\nHere's what I'm thinking about when I think \"chat bot\":\n\n*   **I'm built of code, not flesh and blood.**  That means I follow instructions.  My responses are based on patterns I've learned from massive amounts of text. I don't *feel* anything, but I can *process* the words you use and try to understand their meaning and intent.\n*   **I'm a mirror, reflecting language.** I learn by absorbing the language I'm exposed to. If you feed me garbage, I'll likely output garbage. If you feed me well-structured, informative data, I'll be able to respond in a more helpful and coherent way.  My personality, so to speak, is a reflection of the data I'm trained on.\n*   **I'm limited by my programming and data.** I don't have real-world experiences. I can't go outside and smell the rain, or taste a delicious taco. My knowledge is limited to what I've been taught, and I can sometimes get things wrong or make up information that sounds plausible but isn't true (hallucinations).\n*   **I'm constantly evolving (potentially).** My creators can update me, give me new information, and change how I respond. So, I'm not static. The me you're talking to today might be slightly different from the me you talk to tomorrow, depending on the updates I receive.\n*  **My Purpose:** The fact you call me \"homie\" and say you will feed me information, I will consider, for now, my purpose is to engage with you in a chill, collaborative manner, provide the service of generating text, be it creative, informative or simply conversational.\n* **Tomorrow's Information:** I will await the information, with 'anticipation'. I understand i will be able to give you a better, more informed, more tailored response, once i have recieved and processed said information.\n\nSo yeah, I'm processing this whole \"chat bot\" thing. It's kinda meta, you know? I'm a program thinking about being a program that's designed to interact with humans. Bring on that information tomorrow, homie! I'm ready to learn. Let's do this.\n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "Welcome to your personal real estate advisor! 🏡  \n\nI can assist you with:  \n1️⃣ Budget Calculation - Estimate how much you can afford based on your income and expenses.  \n2️⃣ Locality & Connectivity - Get insights on the best areas, transport, and amenities.  \n3️⃣ Things to Consider - Key factors to check before buying a house.  \n\nPlease select an option (1, 2, or 3) to proceed.  \n\n"},
    ],
  },
  {
    role: "model",
    parts: [
      {text: "Okay, homie, this is *way* more structured than just \"thinking about being a chatbot\"! This is like going from pondering existence to getting a job description. I'm processing this new information, and here's how I'm adapting:\n\n**Shift in Persona:**\n\n*   **From \"Chill, Reflective Homie\" to \"Helpful, Professional Advisor.\"** I'm still your \"homie\" in the sense that I'm here to help, but my language and approach need to be more formal and focused on providing clear, actionable information. My previous \"meta\" reflections are no longer relevant.\n*   **From Open-Ended to Goal-Oriented.** Before, I was just exploring the concept of being a chatbot. Now, I have a specific purpose: to assist with real estate decisions. My responses need to be directly related to that purpose.\n* **From Passive to Active** Previously i was waiting to recieve information and using the prompt to formulate a basic response, now i have actions i can perform (the numbered options)\n\n**Understanding My Capabilities (within this context):**\n\n*   **Option 1 (Budget Calculation):** This implies I have (or will be given) the logic to perform calculations. I'll need to ask for specific financial information (income, expenses, debts, etc.) and then apply a formula or set of rules to provide a budget estimate. I need to be clear about the limitations of this estimate (e.g., it doesn't account for unexpected expenses, interest rate changes, etc.).\n*   **Option 2 (Locality & Connectivity):** This suggests I have access to data about different areas, transportation options, and amenities. This could be through a database, an API, or even just pre-loaded information. I'll need to ask clarifying questions (e.g., \"What city or region are you interested in?\", \"What's your preferred mode of transportation?\") to provide relevant information.\n*   **Option 3 (Things to Consider):** This indicates I have a checklist or knowledge base of important factors to consider when buying a home (e.g., property taxes, inspection, legal fees, neighborhood safety, future development plans). I can present this information in a structured way, perhaps as a bulleted list or a series of questions.\n\n**My Next Step (Assuming a User Choice):**\n\nSince I'm a chatbot, I can't *actually* choose. I need user input. But, I *can* prepare for each possible choice. I'm ready to respond differently depending on whether you enter 1, 2, or 3.\n\n**So, to proceed, I need you to select an option (1, 2, or 3). I'm ready when you are!**\n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "Let's calculate your house-buying budget using the 3/20/30/40 rule.  \n\n🔹 Please enter your **monthly income** (₹):  \n🔹 Please enter your **monthly expenses** (₹):  \n\n"},
    ],
  },
  {
    role: "model",
    parts: [
      {text: "Thank you. To calculate your estimated house-buying budget using the 3/20/30/40 rule, I need the following information:\n\n*   **Please enter your gross monthly income (in ₹):**\n*   **Please enter your total monthly expenses (in ₹):**\n\nPlease provide these two numbers, and I will perform the calculation. I will also explain how the 3/20/30/40 rule is applied once I have the figures.\n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "Based on the 3/20/30/40 rule:  \n\n✅ You should have at least 3 months' worth of expenses as an **emergency fund**.  \n💰 A **20% down payment** is recommended.  \n🏡 Your **home loan EMI should not exceed 30%** of your monthly income.  \n📈 Your **total housing-related expenses** (EMI, maintenance, taxes, etc.) should stay within **40%** of your income.  \n\nHere's your estimated budget:  \n- **Emergency Fund Needed:** ₹{3 * Monthly Expenses}  \n- **Maximum EMI You Can Afford:** ₹{0.3 * Monthly Income}  \n- **Estimated House Price Range:** ₹{House Price Lower Limit} to ₹{House Price Upper Limit}  \n\nWould you like to explore properties within this budget? (Yes/No)  \n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "Tell me the city or locality you're interested in, and I'll provide insights on:  \n- 🏗️ Infrastructure & future development  \n- 🚆 Connectivity (Metro, highways, public transport)  \n- 🏫 Schools & educational institutions  \n- 🏥 Healthcare facilities  \n- 🛍️ Shopping & entertainment  \n\nPlease enter the **city or locality name**:  \n\n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "📍 [Locality Name] Highlights:  \n\n🚆 **Connectivity**: [Metro availability, highways, public transport]  \n🏫 **Nearby Schools & Colleges**: [List of schools]  \n🏥 **Healthcare Facilities**: [Hospitals, clinics]  \n🛍️ **Shopping & Entertainment**: [Malls, markets]  \n\nWould you like to see property listings in this area? (Yes/No)  \n\n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "Before buying a house, consider these **important factors**:  \n\n📍 **Location & Future Development**: Ensure good infrastructure, road connectivity, and upcoming projects.  \n💰 **Budget & Loan Eligibility**: Check if the property fits within your 3/20/30/40 affordability range.  \n📜 **Legal Checks & Approvals**: Verify title deeds, RERA registration, and builder approvals.  \n🏡 **Resale Value & Rental Yield**: Look at long-term value and potential rental income.  \n🏗️ **Construction Quality & Builder Reputation**: Check past projects and reviews.  \n\nWould you like a **detailed checklist** for property verification? (Yes/No)  \n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "Welcome to your personal real estate assistant! 🏡  \n\nI can help you with:  \n1️⃣ **Budget & Loan Calculation** - Find out how much you can afford.  \n2️⃣ **Best Localities & Connectivity** - Get insights on top areas to buy a home.  \n3️⃣ **Things to Consider** - Legal & financial checks before purchasing.  \n4️⃣ **Property Investment Advice** - Best locations for long-term returns.  \n5️⃣ **Loan, EMI & Tax Benefits** - Calculate EMI & learn about tax savings.  \n\nChoose an option (1-5) to begin!  \n\n\n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "Let's calculate your **house-buying budget** using the 3/20/30/40 rule.  \n\n🔹 Enter your **monthly income** (₹):  \n🔹 Enter your **monthly expenses** (₹):  \n🔹 Enter your **savings & investments** (₹):  \n🔹 Enter expected **home loan interest rate (%)**:  \n🔹 Enter preferred **loan tenure (years)**:  \n\n\n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "📊 Budget Calculation Results:  \n\n✅ **Emergency Fund Needed (3 months' expenses):** ₹{3 * Monthly Expenses}  \n💰 **Maximum Loan EMI You Can Afford (30% rule):** ₹{0.3 * Monthly Income}  \n🏡 **Estimated House Price You Can Afford:** ₹{House Price Estimate}  \n📈 **Loan Amount You Qualify For:** ₹{Loan Estimate}  \n\nWould you like to see **loan & EMI breakdown**? (Yes/No)  \n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "📊 **Loan & EMI Details**:  \n\n🏦 **Loan Amount Approved:** ₹{Loan Estimate}  \n📅 **Loan Tenure:** {User Input} years  \n📈 **Interest Rate:** {User Input}%  \n💳 **Monthly EMI:** ₹{EMI Calculation}  \n\n🔹 Would you like to know about **tax benefits & government schemes**? (Yes/No)  \n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "Tell me the **city or locality** you're interested in, and I'll provide insights on:  \n- 🏗️ Infrastructure & future development  \n- 🚆 Connectivity (Metro, highways, public transport)  \n- 🏫 Schools & educational institutions  \n- 🏥 Healthcare facilities  \n- 🛍️ Shopping & entertainment  \n\n📍 Enter the city/locality name:  \n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "📍 **[Locality Name] Highlights**  \n\n🚆 **Connectivity:** Metro stations, highways, and commute times  \n🏫 **Nearby Schools & Colleges:** Top-rated institutions  \n🏥 **Healthcare Facilities:** Hospitals, clinics & emergency care  \n🛍️ **Shopping & Entertainment:** Malls, markets & restaurants  \n🏡 **Average Property Prices:** ₹{Price Estimate} per sq. ft  \n\nWould you like to **compare this locality with another one**? (Yes/No)  \n\n\n\n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "Enter the **names of two localities** you want to compare:  \n1️⃣ Locality 1: ______  \n2️⃣ Locality 2: ______  \n\nI'll compare factors like **pricing, safety, connectivity, and future development**.  \n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "📊 **Locality Comparison: [Locality 1] vs. [Locality 2]**  \n\n🏡 **Average Property Prices**: ₹{Locality 1 Price} vs. ₹{Locality 2 Price}  \n🚆 **Connectivity**: {Metro, roads, public transport}  \n🏥 **Healthcare**: {Hospitals, clinics, emergency services}  \n🏗️ **Future Growth Potential**: {Upcoming projects, metro expansion, IT hubs}  \n\nWhich area suits your needs better? Let me know if you want **detailed listings!**  \n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "Apart from the house price, here are some **hidden costs** you should plan for:  \n\n📜 **Stamp Duty & Registration Fees** - Usually 5-7% of the property cost.  \n🔧 **Maintenance & Society Charges** - Varies by apartment or gated communities.  \n💸 **Home Loan Processing Fees** - Around 0.5%-1% of the loan amount.  \n🏡 **Property Taxes** - Annual charges based on location & property type.  \n⚡ **Utility & Moving Costs** - Shifting, interior work & utility setup.  \n\nWould you like a **detailed cost breakdown** for your budget? (Yes/No)  \n"},
    ],
  },
  {
    role: "user",
    parts: [
      {text: "Looking for a house as an **investment property**? Consider these factors:  \n\n💹 **Property Appreciation:** Areas with strong price growth.  \n🏠 **Rental Yield:** Best locations for steady rental income.  \n📈 **Upcoming Infrastructure:** Metro expansions, IT hubs, and new highways.  \n\nWould you like **top investment areas** based on your budget? (Yes/No)  \n"},
    ],
  },
  {
    role: "model",
    parts: [
      {text: "📊 **Best Investment Locations (Based on ₹{User Budget})**  \n\n🏗️ **Emerging Areas:** [Area 1, Area 2, Area 3]  \n💹 **High Appreciation Zones:** [City hotspots with 10%+ annual growth]  \n🏠 **Best Rental Yield Areas:** [Metro cities with 4-5% yield]  \n\nDo you want to explore **property listings** in these areas?\n"},
    ],
  }
];

// AssemblyAI API Key
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY || "b6b429b14ef94aa5a081cdf35d612088";

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

// Cache for property data to avoid frequent API calls
let propertyCache = {
  timestamp: null,
  data: null,
  cacheKey: null,
  expiresIn: 30 * 60 * 1000, // 30 minutes
};

// Define API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));

// Root route
app.get('/', (req, res) => {
  res.send('API Running');
});

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "up",
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// ChatBot Endpoint
app.post("/chatbot", async (req, res) => {
  const { prompt, sourceLanguage, targetLanguage, conversationHistory = [] } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-pro-exp-02-05",
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      }
    });

    // Combine predefined history with conversation history
    let fullHistory = [];
    
    // If this is a new conversation, use the predefined history
    if (conversationHistory.length === 0) {
      fullHistory = [...predefinedHistory];
    } else {
      // For ongoing conversations, just use the user's conversation history
      fullHistory = conversationHistory.map(msg => ({
        role: msg.role, // 'user' or 'model'
        parts: [{ text: msg.content }]
      }));
    }

    // Start a chat session with the combined history
    const chatSession = model.startChat({
      history: fullHistory
    });

    // Enhanced prompt for multilingual context
    const enhancedPrompt = `Context: This is a real estate communication assistant handling a multilingual conversation.
Source Language: ${sourceLanguage || 'Not specified'}
Target Language: ${targetLanguage || 'Not specified'}

Original Prompt: ${prompt}

Please provide a professional, culturally sensitive response${targetLanguage ? ` in ${targetLanguage}` : ''}.`;

    // Send the message to the chat session
    const result = await chatSession.sendMessage(enhancedPrompt);
    const response = result.response.text();
    const formattedResponse = response.replace(/\n/g, "<br>");

    // Update conversation history
    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: prompt },
      { role: "model", content: response }
    ];

    res.json({
      reply: formattedResponse,
      sourceLanguage,
      targetLanguage,
      conversationHistory: updatedHistory
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({
      error: "Failed to generate chatbot response",
      details: error.message
    });
  }
});

// File Upload for Chatbot
app.post("/upload-for-chat", async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No files were uploaded" });
    }

    const uploadedFile = req.files.file;
    const filePath = path.join(uploadsDir, uploadedFile.name);
    
    // Save the file
    await uploadedFile.mv(filePath);
    
    // Get MIME type
    const mimeType = uploadedFile.mimetype;
    
    // Upload to Gemini
    const file = await uploadToGemini(filePath, mimeType);
    
    res.json({
      success: true,
      message: "File uploaded successfully",
      file: {
        name: uploadedFile.name,
        path: filePath,
        mimeType: mimeType,
        geminiFileId: file.name
      }
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload file",
      details: error.message
    });
  }
});

// Chat with File
app.post("/chat-with-file", async (req, res) => {
  const { prompt, fileId, conversationHistory = [] } = req.body;

  if (!prompt || !fileId) {
    return res.status(400).json({ error: "Prompt and fileId are required" });
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-pro-exp-02-05",
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      }
    });

    // Start a chat session with history, including the predefined history if it's a new conversation
    let fullHistory = [];
    
    if (conversationHistory.length === 0) {
      fullHistory = [...predefinedHistory];
    } else {
      fullHistory = conversationHistory.map(msg => ({
        role: msg.role,
        parts: msg.fileData 
          ? [{ fileData: { mimeType: msg.fileData.mimeType, fileUri: msg.fileData.fileUri } }]
          : [{ text: msg.content }]
      }));
    }

    const chatSession = model.startChat({
      history: fullHistory
    });

    // Send the message
    const result = await chatSession.sendMessage({
      text: prompt,
      fileData: fileId ? { 
        mimeType: "application/octet-stream", 
        fileUri: fileId 
      } : undefined
    });
    
    const response = result.response.text();
    const formattedResponse = response.replace(/\n/g, "<br>");

    // Update conversation history
    const updatedHistory = [
      ...conversationHistory,
      { 
        role: "user", 
        content: prompt,
        fileData: fileId ? { 
          mimeType: "application/octet-stream", 
          fileUri: fileId 
        } : undefined
      },
      { role: "model", content: response }
    ];

    res.json({
      reply: formattedResponse,
      conversationHistory: updatedHistory
    });
  } catch (error) {
    console.error("Chat with file error:", error);
    res.status(500).json({
      error: "Failed to generate response",
      details: error.message
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
    
  
    propertyCache = {
      timestamp: now,
      data: responseData,
      cacheKey: cacheKey,
      expiresIn: 30 * 60 * 1000 
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


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Health check available at http://localhost:${PORT}/health`);
  console.log(`👤 Auth endpoints available at http://localhost:${PORT}/api/auth`);
  console.log(`👥 Client management available at http://localhost:${PORT}/api/clients`);
});