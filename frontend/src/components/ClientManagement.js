import React, { useState, useEffect } from 'react';
import './ClientManagement.css';
import { createClient, getClients, addClientNote, addClientConversation } from '../services/clientService';
import ConversationForm from '../components/ConversationForm';

const ClientManagement = ({ currentLanguage }) => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isAddingConversation, setIsAddingConversation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredLanguages: [],
    requirements: [],
    status: 'new_inquiry',
    notes: [] // Initialize as an array
  });

  // Fetch clients on initial load
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await getClients();
        if (response.success) {
          // Transform notes to ensure compatibility with the UI
          const transformedClients = response.data.map(client => ({
            ...client,
            // Ensure conversations array exists
            conversations: client.conversations || [],
            // Convert notes array to string for display if needed
            notesDisplay: Array.isArray(client.notes) 
              ? client.notes.map(note => note.text || note).join('\n\n')
              : client.notes || ''
          }));
          
          setClients(transformedClients);
          setFilteredClients(transformedClients);
        } else {
          setError(response.message);
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Failed to load clients. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
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
        (typeof client.notes === 'string' && client.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (Array.isArray(client.notes) && client.notes.some(note => 
          (typeof note === 'string' && note.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (note.text && note.text.toLowerCase().includes(searchTerm.toLowerCase()))
        ))
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
    // Ensure the client has the right structure for display
    const displayClient = {
      ...client,
      conversations: client.conversations || [],
      // Convert notes array to string for display if needed
      notes: Array.isArray(client.notes)
        ? client.notes.map(note => note.text || note).join('\n\n')
        : client.notes || ''
    };
    
    setSelectedClient(displayClient);
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
      notes: [] // Reset to an empty array
    });
  };

  const handleNewClientChange = (field, value) => {
    setNewClientData(prev => ({
      ...prev,
      [field]: field === 'notes' ? (Array.isArray(value) ? value : [value]) : value
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

  const handleSaveClient = async () => {
    // Validate required fields
    if (!newClientData.name || !newClientData.phone) {
      alert('Name and phone are required fields.');
      return;
    }
  
    try {
      // Format notes for MongoDB
      const notesValue = typeof newClientData.notes === 'string' && newClientData.notes.trim() !== '' 
        ? [{ text: newClientData.notes }] 
        : Array.isArray(newClientData.notes) && newClientData.notes.length > 0
          ? newClientData.notes.map(note => typeof note === 'string' ? { text: note } : note)
          : [];
      
      // Prepare client data for submission
      const clientDataToSend = {
        ...newClientData,
        notes: notesValue,
        // Add empty conversations array to match frontend expectations
        conversations: []
      };
  
      // Send new client data to the backend
      const response = await createClient(clientDataToSend);
      if (response.success) {
        // Format the returned client for display
        const newClient = {
          ...response.data,
          conversations: response.data.conversations || [],
          // Convert notes array to string for display
          notes: Array.isArray(response.data.notes)
            ? response.data.notes.map(note => note.text || note).join('\n\n')
            : response.data.notes || ''
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
          notes: [] // Reset to an empty array
        });
        setSelectedClient(newClient);
      } else {
        alert(response.message || 'Failed to save client.');
      }
    } catch (error) {
      console.error('Error saving client:', error);
      alert('Failed to save client. Please try again.');
    }
  };

  const handleAddNote = async (clientId, noteText) => {
    if (!noteText.trim()) return;
  
    try {
      // Call API to add note
      const response = await addClientNote(clientId, noteText);
      
      if (response.success) {
        // Update clients list with new note
        setClients(prev =>
          prev.map(client =>
            client._id === clientId
              ? {
                  ...client,
                  notes: Array.isArray(client.notes)
                    ? [...client.notes, { text: noteText, date: new Date() }]
                    : [{ text: noteText, date: new Date() }],
                  notesDisplay: (Array.isArray(client.notes)
                    ? client.notes.map(note => typeof note === 'string' ? note : note.text).join('\n\n')
                    : client.notes || '') + '\n\n' + noteText
                }
              : client
          )
        );
      
        // Update selected client if necessary
        if (selectedClient && selectedClient._id === clientId) {
          setSelectedClient(prev => ({
            ...prev,
            notes: prev.notes ? `${prev.notes}\n\n${noteText}` : noteText
          }));
        }
      } else {
        alert(response.message || 'Failed to add note.');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note. Please try again.');
    }
  };

  const handleAddConversation = () => {
    if (!selectedClient) {
      alert('Please select a client first.');
      return;
    }
    setIsAddingConversation(true);
  };

  const handleCancelAddConversation = () => {
    setIsAddingConversation(false);
  };

  const handleSaveConversation = async (clientId, conversationData) => {
    try {
      const response = await addClientConversation(clientId, conversationData);
      
      if (response.success) {
        // Update clients list
        setClients(prev => 
          prev.map(client => 
            client._id === clientId
              ? {
                  ...client,
                  conversations: [...(client.conversations || []), {
                    ...conversationData,
                    _id: Date.now() // Temporary ID until we refresh from server
                  }],
                  lastContact: conversationData.date
                }
              : client
          )
        );
        
        // Update selected client
        if (selectedClient && selectedClient._id === clientId) {
          setSelectedClient(prev => ({
            ...prev,
            conversations: [...(prev.conversations || []), {
              ...conversationData,
              _id: Date.now() // Temporary ID until we refresh from server
            }],
            lastContact: conversationData.date
          }));
        }
        
        // Close the form
        setIsAddingConversation(false);
      } else {
        alert(response.message || 'Failed to add conversation.');
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      alert('Failed to save conversation. Please try again.');
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

  // Display loading state
  if (loading) {
    return <div className="loading-container">Loading clients...</div>;
  }

  // Display error state
  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

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
                key={client._id}
                className={`client-card ${selectedClient && selectedClient._id === client._id ? 'selected' : ''}`}
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
                    {client.requirements && client.requirements.slice(0, 2).map((req, index) => (
                      <span key={index} className={`requirement-tag ${req.priority}`}>
                        {req.value}
                      </span>
                    ))}
                    {client.requirements && client.requirements.length > 2 && (
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
                value={Array.isArray(newClientData.notes) ? newClientData.notes.join('\n\n') : newClientData.notes}
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
                  {selectedClient.requirements && selectedClient.requirements.length > 0 ? (
                    selectedClient.requirements.map((req, index) => (
                      <div key={index} className={`requirement-item ${req.priority}`}>
                        <span className="requirement-type">{req.type.replace('_', ' ')}:</span>
                        <span className="requirement-value">{req.value}</span>
                        <span className={`priority-indicator ${req.priority}`}></span>
                      </div>
                    ))
                  ) : (
                    <div className="no-requirements">No requirements specified</div>
                  )}
                </div>
              </div>

              <div className="client-info-card conversations-info">
                <h3>Conversation History</h3>
                {!selectedClient.conversations || selectedClient.conversations.length === 0 ? (
                  <div className="no-conversations">
                    No conversation history yet.
                  </div>
                ) : (
                  <div className="conversations-timeline">
                    {selectedClient.conversations.map((conv, idx) => (
                      <div key={conv._id || idx} className="conversation-entry">
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
                <button className="add-conversation-btn" onClick={handleAddConversation}>
                  Add New Conversation
                </button>
              </div>

              <div className="client-info-card notes-info">
                <h3>Notes</h3>
                <div className="notes-content">
                  {selectedClient.notes && typeof selectedClient.notes === 'string' ? (
                    selectedClient.notes.split("\n\n").map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))
                  ) : Array.isArray(selectedClient.notes) ? (
                    selectedClient.notes.map((note, index) => (
                      <p key={index}>{typeof note === 'string' ? note : note.text}</p>
                    ))
                  ) : (
                    <p>No notes available</p>
                  )}
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
                      handleAddNote(selectedClient._id, noteInput.value);
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

      {/* Conversation Form Modal */}
      {isAddingConversation && (
        <ConversationForm
          clientId={selectedClient._id}
          onSave={handleSaveConversation}
          onCancel={handleCancelAddConversation}
        />
      )}
    </div>
  );
};

export default ClientManagement;