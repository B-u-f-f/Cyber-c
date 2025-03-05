// src/components/ConversationForm.js
import React, { useState } from 'react';
import './ConversationForm.css'; // You'll need to create this CSS file

const ConversationForm = ({ clientId, onSave, onCancel }) => {
  const [conversationData, setConversationData] = useState({
    type: 'call',
    summary: '',
    date: new Date().toISOString().slice(0, 16) // Format for datetime-local input
  });

  const handleChange = (e) => {
    setConversationData({
      ...conversationData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!conversationData.summary.trim()) {
      alert('Please provide a summary of the conversation.');
      return;
    }
    
    // Convert date string back to Date object
    const formattedData = {
      ...conversationData,
      date: new Date(conversationData.date)
    };
    
    onSave(clientId, formattedData);
  };

  return (
    <div className="conversation-form-overlay">
      <div className="conversation-form-container">
        <h3>Add New Conversation</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="type">Conversation Type:</label>
            <select 
              id="type"
              name="type"
              value={conversationData.type}
              onChange={handleChange}
              className="form-select"
            >
              <option value="call">Phone Call</option>
              <option value="meeting">In-person Meeting</option>
              <option value="email">Email</option>
              <option value="message">Text/WhatsApp</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="date">Date & Time:</label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={conversationData.date}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="summary">Summary:</label>
            <textarea
              id="summary"
              name="summary"
              value={conversationData.summary}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              placeholder="Enter a summary of your conversation with the client..."
            ></textarea>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-btn"
            >
              Save Conversation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConversationForm;