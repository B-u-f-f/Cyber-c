import React, { useState } from 'react';
import './BrokerConnect.css';

const BrokerConnect = () => {
  const [activeBroker, setActiveBroker] = useState(null);
  const [showChatRoom, setShowChatRoom] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  // Sample broker data - in a real app, this would come from an API
  const brokers = [
    {
      id: 1,
      name: "Sarah Johnson",
      specialty: "Residential Properties",
      rating: 4.8,
      experience: "7 years",
      photo: "https://randomuser.me/api/portraits/women/44.jpg",
      available: true
    },
    {
      id: 2,
      name: "Michael Rodriguez",
      specialty: "Commercial Real Estate",
      rating: 4.9,
      experience: "12 years",
      photo: "https://randomuser.me/api/portraits/men/32.jpg",
      available: true
    },
    {
      id: 3,
      name: "Amanda Chen",
      specialty: "Luxury Properties",
      rating: 4.7,
      experience: "5 years",
      photo: "https://randomuser.me/api/portraits/women/66.jpg",
      available: false
    }
  ];

  const handleConnectClick = (broker) => {
    setActiveBroker(broker);
    setShowChatRoom(true);
    
    // Add welcome message from broker
    setChatMessages([
      {
        id: Date.now(),
        sender: 'broker',
        text: `Hello! I'm ${broker.name}, a real estate broker specializing in ${broker.specialty}. How can I help you today?`,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }
    ]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: message,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    
    setChatMessages([...chatMessages, userMessage]);
    setMessage('');

    // Simulate broker response after a brief delay
    setTimeout(() => {
      const brokerResponses = [
        "I'd be happy to help you with that! Could you provide more details about what you're looking for?",
        "That's a great question. Based on the current market trends, I would recommend...",
        "I have several properties that might match your criteria. Would you like me to send you some options?",
        "Let me check that information for you. I'll get back to you shortly.",
        "Would it be possible to schedule a call to discuss this in more detail?"
      ];
      
      const randomResponse = brokerResponses[Math.floor(Math.random() * brokerResponses.length)];
      
      const brokerMessage = {
        id: Date.now(),
        sender: 'broker',
        text: randomResponse,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      
      setChatMessages(prevMessages => [...prevMessages, brokerMessage]);
    }, 1000);
  };

  const closeChatRoom = () => {
    setShowChatRoom(false);
  };

  return (
    <div className="broker-connect-container">
      <div className="broker-connect-header">
        <h3>Connect with a Broker</h3>
        <p>Our experienced real estate brokers are ready to assist you</p>
      </div>

      {!showChatRoom ? (
        <div className="brokers-list">
          {brokers.map(broker => (
            <div key={broker.id} className="broker-card">
              <div className="broker-photo">
                <img src={broker.photo} alt={broker.name} />
                <span className={`status-indicator ${broker.available ? 'available' : 'unavailable'}`}></span>
              </div>
              <div className="broker-info">
                <h4>{broker.name}</h4>
                <p className="broker-specialty">{broker.specialty}</p>
                <div className="broker-stats">
                  <span className="broker-rating">
                    <i className="fas fa-star"></i> {broker.rating}
                  </span>
                  <span className="broker-experience">
                    <i className="fas fa-briefcase"></i> {broker.experience}
                  </span>
                </div>
              </div>
              <button 
                className={`connect-btn ${!broker.available ? 'disabled' : ''}`}
                onClick={() => broker.available && handleConnectClick(broker)}
                disabled={!broker.available}
              >
                {broker.available ? 'Connect Now' : 'Unavailable'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="broker-chat-room">
          <div className="chat-header">
            <div className="broker-info-compact">
              <img src={activeBroker.photo} alt={activeBroker.name} />
              <div>
                <h4>{activeBroker.name}</h4>
                <p>{activeBroker.specialty}</p>
              </div>
            </div>
            <button className="close-chat-btn" onClick={closeChatRoom}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="chat-messages">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                <div className="message-bubble">
                  <p>{msg.text}</p>
                  <span className="message-time">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>
          
          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="chat-input"
            />
            <button type="submit" className="send-button">
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default BrokerConnect;