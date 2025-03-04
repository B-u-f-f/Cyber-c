import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatAssistant.css';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'mr', name: 'Marathi' },
  { code: 'te', name: 'Telugu' }
];

// Real estate topics and phrases in multiple languages
const realEstateTopics = {
  en: [
    { topic: "Property Search", phrases: ["Show me apartments in", "Looking for properties in", "Houses for sale in"] },
    { topic: "Budget Discussion", phrases: ["My budget is", "I can spend up to", "Price range"] },
    { topic: "Property Features", phrases: ["I need at least", "Looking for", "Must have"] },
    { topic: "Loan Information", phrases: ["Mortgage details", "Loan options", "Interest rates"] }
  ],
  hi: [
    { topic: "संपत्ति खोज", phrases: ["मुझे अपार्टमेंट दिखाओ", "में संपत्ति की तलाश", "में बिक्री के लिए घर"] },
    { topic: "बजट चर्चा", phrases: ["मेरा बजट है", "मैं खर्च कर सकता हूं", "कीमत सीमा"] },
    { topic: "संपत्ति विशेषताएं", phrases: ["मुझे कम से कम चाहिए", "की तलाश है", "होना चाहिए"] },
    { topic: "ऋण जानकारी", phrases: ["बंधक विवरण", "ऋण विकल्प", "ब्याज दर"] }
  ],
  mr: [
    { topic: "मालमत्ता शोध", phrases: ["मला अपार्टमेंट दाखवा", "मधील मालमत्ता शोधत आहे", "मध्ये विक्रीसाठी घरे"] },
    { topic: "अंदाजपत्रक चर्चा", phrases: ["माझे बजेट आहे", "मी खर्च करू शकतो", "किंमत श्रेणी"] },
    { topic: "मालमत्ता वैशिष्ट्ये", phrases: ["मला किमान हवे आहे", "शोधत आहे", "असणे आवश्यक आहे"] },
    { topic: "कर्ज माहिती", phrases: ["तारण तपशील", "कर्ज पर्याय", "व्याज दर"] }
  ],
  te: [
    { topic: "ఆస్తి శోధన", phrases: ["నాకు అపార్ట్మెంట్‌లను చూపించండి", "లో ప్రాపర్టీలను వెతుకుతున్నాను", "లో అమ్మకానికి ఇళ్లు"] },
    { topic: "బడ్జెట్ చర్చ", phrases: ["నా బడ్జెట్", "నేను ఖర్చు చేయగలను", "ధర పరిధి"] },
    { topic: "ఆస్తి లక్షణాలు", phrases: ["నాకు కనీసం కావాలి", "కోసం చూస్తున్నాను", "తప్పనిసరిగా ఉండాలి"] },
    { topic: "రుణ సమాచారం", phrases: ["తాకట్టు వివరాలు", "రుణ ఎంపికలు", "వడ్డీ రేట్లు"] }
  ]
};

const ChatAssistant = ({ currentLanguage }) => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your Real Estate Assistant. How can I help you today?", 
      sender: "assistant",
      lang: "en"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState(currentLanguage);
  const [targetLanguage, setTargetLanguage] = useState(currentLanguage);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPhrases, setSuggestedPhrases] = useState([]);
  
  const messagesEndRef = useRef(null);
  
  // Update language preferences when currentLanguage changes
  useEffect(() => {
    setSourceLanguage(currentLanguage);
  }, [currentLanguage]);
  
  // Scroll to bottom of chat when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Generate suggested phrases based on the current conversation
  useEffect(() => {
    if (messages.length > 0) {
      const topics = realEstateTopics[sourceLanguage] || realEstateTopics.en;
      const randomTopics = getRandomElements(topics, 2);
      const phrases = randomTopics.flatMap(topic => 
        getRandomElements(topic.phrases, 1).map(phrase => `${phrase}...`)
      );
      setSuggestedPhrases(phrases);
    }
  }, [messages, sourceLanguage]);
  
  const getRandomElements = (array, count) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;
    
    const newUserMessage = {
      id: Date.now(),
      text: inputText,
      sender: "user",
      lang: sourceLanguage
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Call your API here
      const response = await axios.post('http://localhost:5000/chatbot', {
        prompt: inputText,
        sourceLanguage,
        targetLanguage
      });
      
      const assistantMessage = {
        id: Date.now() + 1,
        text: response.data.reply,
        sender: "assistant",
        lang: targetLanguage
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again.",
        sender: "assistant",
        lang: "en"
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePhraseClick = (phrase) => {
    setInputText(phrase);
  };
  
  return (
    <div className="chat-assistant-container">
      <div className="chat-header">
        <h2>Real Estate Chat Assistant</h2>
        <div className="language-controls">
          <div className="language-select">
            <label>I speak:</label>
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
            >
              {languages.map(lang => (
                <option key={`source-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="language-select">
            <label>Assistant speaks:</label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
            >
              {languages.map(lang => (
                <option key={`target-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.sender === "assistant" ? "assistant" : "user"}`}
          >
            <div className="message-bubble">
              <div 
                className="message-text"
                dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br>') }}
              />
              <div className="message-lang">{
                languages.find(lang => lang.code === message.lang)?.name || message.lang
              }</div>
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
      
      {suggestedPhrases.length > 0 && (
        <div className="suggested-phrases">
          <span className="suggestions-label">Suggested:</span>
          {suggestedPhrases.map((phrase, index) => (
            <button 
              key={index}
              className="phrase-button"
              onClick={() => handlePhraseClick(phrase)}
            >
              {phrase}
            </button>
          ))}
        </div>
      )}
      
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