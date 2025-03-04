import React, { useState, useEffect } from 'react';
import './ClientManagement.css';

// Sample client data - in a real app, you would fetch this from your API
const sampleClients = [
  {
    id: 1,
    name: "Aditya Sharma",
    email: "aditya.sharma@example.com",
    phone: "+91 98765 43210",
    preferredLanguages: ["en", "hi"],
    requirements: [
      { type: "property_type", value: "Apartment", priority: "high" },
      { type: "location", value: "Bandra", priority: "high" },
      { type: "feature", value: "Sea View", priority: "medium" },
      { type: "budget", value: "₹2.5 Cr", priority: "medium" }
    ],
    status: "interested",
    lastContact: "2025-03-01T10:30:00",
    notes: "Looking for 3BHK apartment in Bandra with sea view. Budget around 2.5 Cr. Prefers to communicate in Hindi for detailed discussions.",
    conversations: [
      { id: 101, date: "2025-03-01T10:30:00", type: "in-person", summary: "Initial meeting to discuss requirements" },
      { id: 102, date: "2025-03-05T14:45:00", type: "phone", summary: "Followup call to confirm budget details" }
    ]
  },
  {
    id: 2,
    name: "Priya Desai",
    email: "priya.desai@example.com",
    phone: "+91 87654 32109",
    preferredLanguages: ["mr", "en"],
    requirements: [
      { type: "property_type", value: "Villa", priority: "high" },
      { type: "location", value: "Pune Suburbs", priority: "high" },
      { type: "feature", value: "Gated Community", priority: "high" },
      { type: "budget", value: "₹1.8 Cr", priority: "medium" }
    ],
    status: "highly_interested",
    lastContact: "2025-03-02T14:15:00",
    notes: "Looking for a villa in a gated community in Pune suburbs. Prefers communication in Marathi. Budget is flexible up to 2 Cr for the right property.",
    conversations: [
      { id: 201, date: "2025-03-02T14:15:00", type: "virtual", summary: "Virtual meeting to discuss property types" },
      { id: 202, date: "2025-03-07T11:30:00", type: "in-person", summary: "Site visit to three properties in Pune" },
      { id: 203, date: "2025-03-08T09:45:00", type: "email", summary: "Sent property details and pricing options" }
    ]
  },
  {
    id: 3,
    name: "Ravi Krishnan",
    email: "ravi.k@example.com",
    phone: "+91 76543 21098",
    preferredLanguages: ["te", "en"],
    requirements: [
      { type: "property_type", value: "Apartment", priority: "high" },
      { type: "location", value: "Hitech City", priority: "high" },
      { type: "feature", value: "Close to Metro", priority: "high" },
      { type: "budget", value: "₹1.2 Cr", priority: "high" }
    ],
    status: "viewing_scheduled",
    lastContact: "2025-03-03T11:45:00",
    notes: "Looking for 2BHK apartment in Hitech City near metro station. Strict budget of 1.2 Cr. Speaks Telugu and English.",
    conversations: [
      { id: 301, date: "2025-03-03T11:45:00", type: "phone", summary: "Initial call to understand requirements" },
      { id: 302, date: "2025-03-06T16:30:00", type: "virtual", summary: "Virtual tour of 2 apartments" }
    ]
  },
  {
    id: 4,
    name: "Sanjay Patil",
    email: "sanjay.p@example.com",
    phone: "+91 65432 10987",
    preferredLanguages: ["mr"],
    requirements: [
      { type: "property_type", value: "Apartment", priority: "high" },
      { type: "location", value: "Andheri", priority: "medium" },
      { type: "feature", value: "Furnished", priority: "high" },
      { type: "budget", value: "₹80 Lakh", priority: "high" }
    ],
    status: "new_inquiry",
    lastContact: "2025-03-03T16:00:00",
    notes: "Looking for 1BHK furnished apartment in Andheri. Budget is strict at 80 Lakhs. Only speaks Marathi.",
    conversations: [
      { id: 401, date: "2025-03-03T16:00:00", type: "in-person", summary: "Walk-in inquiry at office" }
    ]
  }
];

const ClientManagement = ({ currentLanguage }) => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredLanguages: [],
    requirements: [],
    status: 'new_inquiry',
    notes: ''
  });
  
  useEffect(() => {
    // In a real app, fetch clients from your API
    setClients(sampleClients);
    setFilteredClients(sampleClients);
  }, []);
  
  useEffect(() => {
    // Apply filters when they change
    let results = [...clients];
    
    // Apply search term filter
    if (searchTerm) {
      results = results.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        client.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(client => client.status === statusFilter);
    }
    
    // Apply language filter
    if (languageFilter !== 'all') {
      results = results.filter(client => 
        client.preferredLanguages.includes(languageFilter)
      );
    }
    
    setFilteredClients(results);
  }, [clients, searchTerm, statusFilter, languageFilter]);
  
  const handleClientSelect = (client) => {
    setSelectedClient(client);
  };
  
  const handleAddClient = () => {
    setIsAddingClient(true);
  };
  
  const handleCancelAdd = () => {
    setIsAddingClient(false);
    setNewClientData({
      name: '',
      email: '',
      phone: '',
      preferredLanguages: [],
      requirements: [],
      status: 'new_inquiry',
      notes: ''
    });
  };
  
  const handleNewClientChange = (field, value) => {
    setNewClientData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleNewClientLanguageToggle = (language) => {
    setNewClientData(prev => {
      const updatedLanguages = prev.preferredLanguages.includes(language)
        ? prev.preferredLanguages.filter(lang => lang !== language)
        : [...prev.preferredLanguages, language];
      
      return {
        ...prev,
        preferredLanguages: updatedLanguages
      };
    });
  };
  
  const handleAddRequirement = () => {
    setNewClientData(prev => ({
      ...prev,
      requirements: [
        ...prev.requirements,
        { type: 'feature', value: '', priority: 'medium' }
      ]
    }));
  };
  
  const handleRequirementChange = (index, field, value) => {
    setNewClientData(prev => {
      const updatedRequirements = [...prev.requirements];
      updatedRequirements[index] = {
        ...updatedRequirements[index],
        [field]: value
      };
      
      return {
        ...prev,
        requirements: updatedRequirements
      };
    });
  };
  
  const handleRemoveRequirement = (index) => {
    setNewClientData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };
  
  const handleSaveClient = () => {
    // Validate required fields
    if (!newClientData.name || !newClientData.phone) {
      alert('Name and phone are required fields.');
      return;
    }
    
    // Add new client
    const newClient = {
      id: Date.now(),
      ...newClientData,
      lastContact: new Date().toISOString(),
      conversations: []
    };
    
    setClients(prev => [...prev, newClient]);
    setIsAddingClient(false);
    setNewClientData({
      name: '',
      email: '',
      phone: '',
      preferredLanguages: [],
      requirements: [],
      status: 'new_inquiry',
      notes: ''
    });
    
    // Automatically select the new client
    setSelectedClient(newClient);
  };
  
  const handleAddNote = (clientId, note) => {
    if (!note.trim()) return;
    
    setClients(prev => 
      prev.map(client => 
        client.id === clientId
          ? { ...client, notes: client.notes + "\n\n" + note }
          : client
      )
    );
    
    // Update selected client if necessary
    if (selectedClient && selectedClient.id === clientId) {
      setSelectedClient(prev => ({
        ...prev,
        notes: prev.notes + "\n\n" + note
      }));
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };
  
  const getLanguageName = (code) => {
    const languages = {
      en: "English",
      hi: "Hindi",
      mr: "Marathi",
      te: "Telugu"
    };
    return languages[code] || code;
  };
  
  const getStatusInfo = (status) => {
    const statusInfo = {
      new_inquiry: { label: "New Inquiry", color: "blue" },
      interested: { label: "Interested", color: "purple" },
      highly_interested: { label: "Highly Interested", color: "green" },
      viewing_scheduled: { label: "Viewing Scheduled", color: "orange" },
      offer_made: { label: "Offer Made", color: "red" },
      closed: { label: "Closed", color: "gray" }
    };
    return statusInfo[status] || { label: status, color: "gray" };
  };
  
  return (
    <div className="client-management-container">
      {/* Client list and filters section */}
      <div className="client-list-section">
        <div className="client-list-header">
          <h2>Client Management</h2>
          <button className="add-client-btn" onClick={handleAddClient}>
            Add New Client
          </button>
        </div>
        
        <div className="client-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="client-search-input"
            />
          </div>
          
          <div className="filter-controls">
            <div className="filter-item">
              <label>Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="new_inquiry">New Inquiry</option>
                <option value="interested">Interested</option>
                <option value="highly_interested">Highly Interested</option>
                <option value="viewing_scheduled">Viewing Scheduled</option>
                <option value="offer_made">Offer Made</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div className="filter-item">
              <label>Language:</label>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Languages</option>
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
                <option value="te">Telugu</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="client-list">
          {filteredClients.length === 0 ? (
            <div className="no-clients-message">
              No clients match your filter criteria.
            </div>
          ) : (
            filteredClients.map(client => (
              <div
                key={client.id}
                className={`client-card ${selectedClient && selectedClient.id === client.id ? 'selected' : ''}`}
                onClick={() => handleClientSelect(client)}
              >
                <div className="client-card-header">
                  <div className="client-name">{client.name}</div>
                  <div 
                    className="client-status"
                    style={{ backgroundColor: getStatusInfo(client.status).color }}
                  >
                    {getStatusInfo(client.status).label}
                  </div>
                </div>
                
                <div className="client-contact-info">
                  <div className="client-email">{client.email}</div>
                  <div className="client-phone">{client.phone}</div>
                </div>
                
                <div className="client-languages">
                  {client.preferredLanguages.map(lang => (
                    <span key={lang} className="language-tag">
                      {getLanguageName(lang)}
                    </span>
                  ))}
                </div>
                
                <div className="client-brief">
                  <div className="requirement-preview">
                    {client.requirements.slice(0, 2).map((req, index) => (
                      <span key={index} className={`requirement-tag ${req.priority}`}>
                        {req.value}
                      </span>
                    ))}
                    {client.requirements.length > 2 && (
                      <span className="more-tag">+{client.requirements.length - 2} more</span>
                    )}
                  </div>
                  
                  <div className="last-contact">
                    Last Contact: {formatDate(client.lastContact)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Client detail section */}
      <div className="client-detail-section">
        {isAddingClient ? (
          <div className="add-client-form">
            <h2>Add New Client</h2>
            
            <div className="form-group">
              <label>Name*:</label>
              <input
                type="text"
                value={newClientData.name}
                onChange={(e) => handleNewClientChange('name', e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={newClientData.email}
                onChange={(e) => handleNewClientChange('email', e.target.value)}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>Phone*:</label>
              <input
                type="tel"
                value={newClientData.phone}
                onChange={(e) => handleNewClientChange('phone', e.target.value)}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Preferred Languages:</label>
              <div className="language-toggles">
                {['en', 'hi', 'mr', 'te'].map(lang => (
                  <label key={lang} className="language-toggle">
                    <input
                      type="checkbox"
                      checked={newClientData.preferredLanguages.includes(lang)}
                      onChange={() => handleNewClientLanguageToggle(lang)}
                    />
                    {getLanguageName(lang)}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label>Status:</label>
              <select
                value={newClientData.status}
                onChange={(e) => handleNewClientChange('status', e.target.value)}
                className="form-select"
              >
                <option value="new_inquiry">New Inquiry</option>
                <option value="interested">Interested</option>
                <option value="highly_interested">Highly Interested</option>
                <option value="viewing_scheduled">Viewing Scheduled</option>
                <option value="offer_made">Offer Made</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div className="form-group">
              <div className="requirements-header">
                <label>Requirements:</label>
                <button 
                  type="button" 
                  className="add-requirement-btn"
                  onClick={handleAddRequirement}
                >
                  + Add Requirement
                </button>
              </div>
              
              {newClientData.requirements.length === 0 ? (
                <div className="no-requirements">
                  No requirements added yet. Click the button above to add.
                </div>
              ) : (
                <div className="requirements-list">
                  {newClientData.requirements.map((req, index) => (
                    <div key={index} className="requirement-item">
                      <select
                        value={req.type}
                        onChange={(e) => handleRequirementChange(index, 'type', e.target.value)}
                        className="requirement-type"
                      >
                        <option value="property_type">Property Type</option>
                        <option value="location">Location</option>
                        <option value="feature">Feature</option>
                        <option value="budget">Budget</option>
                      </select>
                      
                      <input
                        type="text"
                        value={req.value}
                        onChange={(e) => handleRequirementChange(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="requirement-value"
                      />
                      
                      <select
                        value={req.priority}
                        onChange={(e) => handleRequirementChange(index, 'priority', e.target.value)}
                        className="requirement-priority"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                      
                      <button
                        type="button"
                        className="remove-requirement-btn"
                        onClick={() => handleRemoveRequirement(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Notes:</label>
              <textarea
                value={newClientData.notes}
                onChange={(e) => handleNewClientChange('notes', e.target.value)}
                className="form-textarea"
                rows="4"
                placeholder="Add any additional notes about the client here..."
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={handleCancelAdd}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="save-btn"
                onClick={handleSaveClient}
              >
                Save Client
              </button>
            </div>
          </div>
        ) : selectedClient ? (
          <div className="client-details">
            <div className="client-header">
              <h2>{selectedClient.name}</h2>
              <div 
                className="client-status-badge"
                style={{ backgroundColor: getStatusInfo(selectedClient.status).color }}
              >
                {getStatusInfo(selectedClient.status).label}
              </div>
            </div>
            
            <div className="client-info-grid">
              <div className="client-info-card contact-info">
                <h3>Contact Information</h3>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{selectedClient.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{selectedClient.phone}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Preferred Languages:</span>
                  <div className="languages-list">
                    {selectedClient.preferredLanguages.map(lang => (
                      <span key={lang} className="language-tag">
                        {getLanguageName(lang)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Contact:</span>
                  <span className="info-value">{formatDate(selectedClient.lastContact)}</span>
                </div>
              </div>
              
              <div className="client-info-card requirements-info">
                <h3>Requirements</h3>
                <div className="requirements-list">
                  {selectedClient.requirements.map((req, index) => (
                    <div key={index} className={`requirement-item ${req.priority}`}>
                      <span className="requirement-type">{req.type.replace('_', ' ')}:</span>
                      <span className="requirement-value">{req.value}</span>
                      <span className={`priority-indicator ${req.priority}`}></span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="client-info-card conversations-info">
                <h3>Conversation History</h3>
                {selectedClient.conversations.length === 0 ? (
                  <div className="no-conversations">
                    No conversation history yet.
                  </div>
                ) : (
                  <div className="conversations-timeline">
                    {selectedClient.conversations.map(conv => (
                      <div key={conv.id} className="conversation-entry">
                        <div className="conversation-date">
                          {formatDate(conv.date)}
                        </div>
                        <div className="conversation-type">
                          <span className={`type-icon ${conv.type}`}></span>
                          {conv.type}
                        </div>
                        <div className="conversation-summary">
                          {conv.summary}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button className="add-conversation-btn">
                  Add New Conversation
                </button>
              </div>
              
              <div className="client-info-card notes-info">
                <h3>Notes</h3>
                <div className="notes-content">
                  {selectedClient.notes.split("\n\n").map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
                <div className="add-note-form">
                  <textarea
                    id="new-note"
                    placeholder="Add a new note..."
                    className="new-note-input"
                    rows="2"
                  ></textarea>
                  <button 
                    className="add-note-btn"
                    onClick={() => {
                      const noteInput = document.getElementById('new-note');
                      handleAddNote(selectedClient.id, noteInput.value);
                      noteInput.value = '';
                    }}
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
            
            <div className="client-actions">
              <button className="action-btn edit-btn">Edit Client</button>
              <button className="action-btn schedule-btn">Schedule Followup</button>
              <button className="action-btn chat-btn">Start Chat</button>
              <button className="action-btn call-btn">Call Client</button>
            </div>
          </div>
        ) : (
          <div className="no-client-selected">
            <div className="instruction-message">
              <h3>Select a client from the list</h3>
              <p>Or add a new client to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientManagement;