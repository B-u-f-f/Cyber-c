import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatAssistant.css';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'mr', name: 'Marathi' },
  { code: 'te', name: 'Telugu' }
];

const introMessages = {
  en: "Hello! I'm your Real Estate Assistant. How can I help you today?",
  hi: "नमस्कार! मैं आपका रियल एस्टेट सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?",
  mr: "नमस्कार! मी आपला रिअल इस्टेट सहाय्यक आहे. मी आपली कशी मदत करू?",
  te: "హలో! నేను మీ రియల్ ఎస్టేట్ అసిస్టెంట్. నేను మీకు ఎలా సహాయం చేయగలను?"
};

const ChatAssistant = ({ currentLanguage }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState(currentLanguage);
  const [targetLanguage, setTargetLanguage] = useState(currentLanguage);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const newIntroMessage = {
      id: 1,
      text: introMessages[sourceLanguage] || introMessages.en,
      sender: "assistant",
      lang: sourceLanguage
    };
    setMessages([newIntroMessage]); 
  }, [sourceLanguage]);

  useEffect(() => {
    setSourceLanguage(currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputText.trim()) return;

    setIsLoading(true);

    try {
      // 🔥 Step 1: Translate user input to English
      const translatedUserInput = await axios.post('http://localhost:5000/live-translate', {
        text: inputText,
        sourceLanguage: sourceLanguage,
        targetLanguage: "en" // Convert to English for AI processing
      });

      const newUserMessage = {
        id: Date.now(),
        text: inputText, 
        sender: "user",
        lang: sourceLanguage
      };
      setMessages(prev => [...prev, newUserMessage]);

      // 🔥 Step 2: Send translated text to chatbot
      const response = await axios.post('http://localhost:5000/chatbot', {
        prompt: translatedUserInput.data.translation,
        sourceLanguage: "en",
        targetLanguage: "en"
      });

      // 🔥 Step 3: Translate chatbot response back to selected language
      const translatedAssistantReply = await axios.post('http://localhost:5000/live-translate', {
        text: response.data.reply,
        sourceLanguage: "en",
        targetLanguage: targetLanguage
      });

      const assistantMessage = {
        id: Date.now() + 1,
        text: translatedAssistantReply.data.translation,
        sender: "assistant",
        lang: targetLanguage
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Error: Try again.", sender: "assistant", lang: "en" }]);
    } finally {
      setIsLoading(false);
      setInputText('');
    }
  };

  return (
    <div className="chat-assistant-container">
      <div className="chat-header">
        <h2>Real Estate Chat Assistant</h2>
        <div className="language-controls">
          <div className="language-select">
            <label>I speak:</label>
            <select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)}>
              {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
            </select>
          </div>
          <div className="language-select">
            <label>Assistant speaks:</label>
            <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
              {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.sender === "assistant" ? "assistant" : "user"}`}>
            <div className="message-bubble">
              <div className="message-text" dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br>') }} />
              <div className="message-lang">{languages.find(lang => lang.code === message.lang)?.name || message.lang}</div>
            </div>
          </div>
        ))}
        {isLoading && <div className="message assistant"><div className="message-bubble"><div className="typing-indicator"><span></span><span></span><span></span></div></div></div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type your message here..." className="chat-input" disabled={isLoading} />
        <button type="submit" className="send-button" disabled={isLoading || !inputText.trim()}>Send</button>
      </form>
    </div>
  );
};

export default ChatAssistant;
