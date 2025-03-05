import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatAssistant.css';

// Supported languages
const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'mr', name: 'Marathi' },
  { code: 'te', name: 'Telugu' },
];

// Introductory messages for each language
const introMessages = {
  en: "Hello! I'm your Real Estate Assistant. How can I help you today?",
  hi: "नमस्कार! मैं आपका रियल एस्टेट सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?",
  mr: "नमस्कार! मी आपला रिअल इस्टेट सहाय्यक आहे. मी आपली कशी मदत करू?",
  te: "హలో! నేను మీ రియల్ ఎస్టేట్ అసిస్టెంట్. నేను మీకు ఎలా సహాయం చేయగలను?",
};

// Error messages for each language
const errorMessages = {
  en: "I'm sorry, there was an error processing your request. Please try again.",
  hi: "क्षमा करें, आपके अनुरोध को संसाधित करने में एक त्रुटि हुई थी। कृपया पुनः प्रयास करें।",
  mr: "क्षमस्व, आपल्या विनंतीवर प्रक्रिया करताना एक त्रुटी आली. कृपया पुन्हा प्रयत्न करा.",
  te: "క్షమించండి, మీ అభ్యర్థనను ప్రాసెస్ చేయడంలో లోపం ఉంది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
};

// Fallback responses for each language when meta-commentary is detected
const fallbackMessages = {
  en: "Let me help you with your real estate inquiry. Could you please provide more details about what you're looking for?",
  hi: "मैं आपकी रियल एस्टेट पूछताछ में मदद करूंगा। क्या आप कृपया बता सकते हैं कि आप क्या खोज रहे हैं?",
  mr: "मी आपल्या रिअल इस्टेट चौकशीत मदत करू शकतो. आपण काय शोधत आहात याबद्दल अधिक माहिती देऊ शकता का?",
  te: "నేను మీ రియల్ ఎస్టేట్ విచారణలో మీకు సహాయం చేస్తాను. మీరు ఏమి కోరుకుంటున్నారో దయచేసి మరిన్ని వివరాలు అందించగలరా?",
};

// Real estate keywords to highlight
const realEstateKeywords = [
  "apartment", "house", "villa", "rent", "buy", "sell", "location", "neighborhood",
  "bedroom", "bathroom", "furnished", "mortgage", "loan", "property", "real estate",
  "broker", "agent", "square feet", "budget", "price", "balcony", "garage", "view", "locality",
  "amenities", "garden", "pool", "security", "investment", "commercial", "residential"
];

// Function to detect if text contains meta-commentary
const containsMetaCommentary = (text) => {
  const metaPatterns = [
    /\*\*Analysis:/i,
    /^Okay, I understand/i,
    /Here's my approach/i,
    /This is a test/i,
    /^I'll analyze/i,
    /^This is a test of my ability/i,
    /Explanation of choices:/i,
    /\d+\.\s+[A-Z][^.]+\./i,
    /<br>/i,
    /---/,
    /my response, keeping all that in mind/i,
    /cultural sensitivity/i,
    /maintain(ing)? professionalism/i,
    /handle typos/i,
    /misspellings/i,
    /guide the user/i
  ];
  
  return metaPatterns.some(pattern => pattern.test(text));
};

// Function to clean response text from meta-commentary and analysis
const cleanResponseText = (text) => {
  // Remove analysis sections like "Analysis:", "Reasoning Breakdown:", etc.
  const analysisPatterns = [
    /\*\*Analysis:\*\*[\s\S]*?(?=\*\*Response:\*\*|$)/i,
    /Okay, I understand[\s\S]*?(?=Thank you|Hello|Hi|Greetings|$)/i,
    /Here's my approach[\s\S]*?(?=Thank you|Hello|Hi|Greetings|$)/i,
    /\*\*Reasoning Breakdown:\*\*[\s\S]*?$/i,
    /This is a test[\s\S]*?(?=Thank you|Hello|Hi|Greetings|$)/i,
    /This is a test of my ability[\s\S]*?(?=---)/i,
    /Explanation of choices:[\s\S]*?$/i,
    /---[\s\S]*?---/,
    /<br>[\s\S]*?<br>/g
  ];
  
  let cleanedText = text;
  
  // Apply all cleaning patterns
  analysisPatterns.forEach(pattern => {
    cleanedText = cleanedText.replace(pattern, '');
  });
  
  // Extract just the actual response if it's marked as such
  const responseMatch = cleanedText.match(/\*\*Response:\*\*([\s\S]*)/i);
  if (responseMatch) {
    cleanedText = responseMatch[1].trim();
  }
  
  // Additional cleaning for HTML-like tags and markdown formatting
  cleanedText = cleanedText.replace(/<br>/g, '\n');
  cleanedText = cleanedText.replace(/\*\*/g, '');
  cleanedText = cleanedText.replace(/---/g, '');
  
  return cleanedText.trim();
};

// Function to highlight real estate keywords in text
const highlightKeywords = (text) => {
  if (!text) return text;
  let highlighted = text;

  realEstateKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    highlighted = highlighted.replace(regex, `<span class="highlight">${keyword}</span>`);
  });

  return highlighted;
};

const ChatAssistant = ({ currentLanguage }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage || 'en');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [highlightedTranscription, setHighlightedTranscription] = useState('');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize chat with intro message
  useEffect(() => {
    const introMessage = {
      id: Date.now(),
      text: introMessages[selectedLanguage] || introMessages.en,
      sender: 'assistant',
      lang: selectedLanguage,
    };
    setMessages([introMessage]);
  }, [selectedLanguage]);

  // Initialize speech recognition
  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      console.error("Your browser does not support Speech Recognition. Try Chrome.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    // Set recognition language based on selected language
    recognition.lang = selectedLanguage === 'en' ? 'en-US' : 
                        selectedLanguage === 'hi' ? 'hi-IN' : 
                        selectedLanguage === 'mr' ? 'mr-IN' : 
                        selectedLanguage === 'te' ? 'te-IN' : 'en-US';

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + " ";
      }
      const trimmedTranscript = transcript.trim();
      setTranscription(trimmedTranscript);
      setInputText(trimmedTranscript);
      
      // Highlight keywords in transcription
      const highlighted = highlightKeywords(trimmedTranscript);
      setHighlightedTranscription(highlighted);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [selectedLanguage, isListening]);

  // Update language for speech recognition when selected language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguage === 'en' ? 'en-US' : 
                                   selectedLanguage === 'hi' ? 'hi-IN' : 
                                   selectedLanguage === 'mr' ? 'mr-IN' : 
                                   selectedLanguage === 'te' ? 'te-IN' : 'en-US';
    }
  }, [selectedLanguage]);

  // Update language when prop changes
  useEffect(() => {
    if (currentLanguage && currentLanguage !== selectedLanguage) {
      setSelectedLanguage(currentLanguage);
    }
  }, [currentLanguage, selectedLanguage]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Toggle speech recognition
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscription('');
      setHighlightedTranscription('');
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  // Handle API requests with error handling
  const makeApiRequest = async (endpoint, data) => {
    try {
      const response = await axios.post(`http://localhost:5000/${endpoint}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error in ${endpoint}:`, error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  };

  // Handle user message submission
  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    const trimmedInput = inputText.trim();
    if (!trimmedInput) return;
    
    setIsLoading(true);
    
    // Add user message immediately
    const userMessage = {
      id: Date.now(),
      text: trimmedInput,
      sender: 'user',
      lang: selectedLanguage,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText(''); // Clear input field immediately for better UX
    setTranscription(''); // Clear transcription
    setHighlightedTranscription('');
    
    try {
      // Validate input before processing
      if (containsMetaCommentary(trimmedInput)) {
        throw new Error('Input contains meta-commentary');
      }
      
      // Step 1: Translate user input to English if needed
      let translatedInput = trimmedInput;
      
      if (selectedLanguage !== 'en') {
        const translationResult = await makeApiRequest('live-translate', {
          text: trimmedInput,
          sourceLanguage: selectedLanguage,
          targetLanguage: 'en',
        });
        
        if (!translationResult.success) {
          throw new Error('Translation failed');
        }
        
        translatedInput = translationResult.data.translation;
      }
      
      // Step 2: Get chatbot response
      const chatbotResult = await makeApiRequest('chatbot', {
        prompt: translatedInput,
        sourceLanguage: 'en',
        targetLanguage: 'en',
      });
      
      if (!chatbotResult.success) {
        throw new Error('Chatbot request failed');
      }
      
      // Clean the response to remove any meta-commentary or analysis
      let cleanedResponse = cleanResponseText(chatbotResult.data.reply);
      
      // If cleaned response is empty or too short after cleaning, use a fallback response
      if (cleanedResponse.length < 20) {
        cleanedResponse = fallbackMessages[selectedLanguage] || fallbackMessages.en;
      }
      
      // Step 3: Translate response back if needed
      let finalResponse = cleanedResponse;
      
      if (selectedLanguage !== 'en') {
        const backTranslationResult = await makeApiRequest('live-translate', {
          text: finalResponse,
          sourceLanguage: 'en',
          targetLanguage: selectedLanguage,
        });
        
        if (!backTranslationResult.success) {
          throw new Error('Back-translation failed');
        }
        
        finalResponse = backTranslationResult.data.translation;
      }
      
      // Add assistant response
      const assistantMessage = {
        id: Date.now(),
        text: finalResponse,
        sender: 'assistant',
        lang: selectedLanguage,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      // Add localized error message
      const errorMessage = {
        id: Date.now(),
        text: errorMessages[selectedLanguage] || errorMessages.en,
        sender: 'assistant',
        lang: selectedLanguage,
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe HTML rendering with proper sanitization
  const renderMessageText = (text) => {
    // Simple line break handling (in production, use a proper HTML sanitizer)
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="chat-assistant-container">
      <div className="chat-header">
        <h2>Real Estate Chat Assistant</h2>
        <div className="language-controls">
          <div className="language-select">
            <label>Language:</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={isLoading}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'assistant' ? 'assistant' : 'user'}`}
          >
            <div className="message-bubble">
              <div className="message-text">
                {renderMessageText(message.text)}
              </div>
              <div className="message-lang">
                {languages.find((lang) => lang.code === message.lang)?.name || message.lang}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant">
            <div className="message-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="speech-recognition-area">
        {isListening && (
          <div className="transcription-box">
            <p dangerouslySetInnerHTML={{ __html: highlightedTranscription || "Listening..." }} />
          </div>
        )}
        <button 
          onClick={toggleListening} 
          className={`mic-button ${isListening ? "active" : ""}`}
          disabled={isLoading}
        >
          {isListening ? "Stop Listening" : "🎤 Start Listening"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message here..."
          className="chat-input"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="send-button" 
          disabled={isLoading || !inputText.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatAssistant;