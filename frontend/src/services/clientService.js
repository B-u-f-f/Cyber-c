// src/services/clientService.js - with fixes for MongoDB integration

import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

// Setup axios instance with auth headers
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      'x-auth-token': token
    }
  };
};

// Add this function to your src/services/clientService.js file

/**
 * Add a conversation to a client
 */
export const addClientConversation = async (clientId, conversationData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/clients/${clientId}/conversations`,
      conversationData,
      getAuthConfig()
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error adding conversation to client ${clientId}:`, error);
    return {
      success: false,
      message: error.response?.data?.msg || 'Failed to add conversation'
    };
  }
};
/**
 * Fetch all clients from the API
 */
export const getClients = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/clients`,
      getAuthConfig()
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching clients:', error);
    return {
      success: false,
      message: error.response?.data?.msg || 'Failed to fetch clients'
    };
  }
};

/**
 * Fetch a single client by ID
 */
export const getClientById = async (clientId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/clients/${clientId}`,
      getAuthConfig()
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error fetching client ${clientId}:`, error);
    return {
      success: false,
      message: error.response?.data?.msg || 'Failed to fetch client details'
    };
  }
};

/**
 * Create a new client
 */
export const createClient = async (clientData) => {
  try {
    // Format notes to match the MongoDB schema
    const formattedData = {
      ...clientData,
      notes: Array.isArray(clientData.notes) && clientData.notes.length > 0 
        ? clientData.notes.map(note => ({ 
            text: typeof note === 'string' ? note : note.text || '',
            date: new Date()
          }))
        : []
    };

    // Ensure conversations field exists to match frontend expectations
    if (!formattedData.conversations) {
      formattedData.conversations = [];
    }

    const response = await axios.post(
      `${API_BASE_URL}/api/clients`,
      formattedData,
      getAuthConfig()
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error creating client:', error);
    return {
      success: false,
      message: error.response?.data?.msg || 'Failed to create client'
    };
  }
};

/**
 * Update an existing client
 */
export const updateClient = async (clientId, clientData, updateLastContact = false) => {
  try {
    // Format notes to match the MongoDB schema if notes are present
    const formattedData = { ...clientData };
    
    if (formattedData.notes) {
      formattedData.notes = Array.isArray(formattedData.notes) 
        ? formattedData.notes.map(note => {
            if (typeof note === 'string') {
              return { text: note, date: new Date() };
            }
            return note;
          })
        : [{ text: formattedData.notes, date: new Date() }];
    }
    
    // Add flag to update last contact timestamp if needed
    if (updateLastContact) {
      formattedData.updateLastContact = true;
    }
    
    const response = await axios.put(
      `${API_BASE_URL}/api/clients/${clientId}`,
      formattedData,
      getAuthConfig()
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error updating client ${clientId}:`, error);
    return {
      success: false,
      message: error.response?.data?.msg || 'Failed to update client'
    };
  }
};

/**
 * Add a note to a client
 */
export const addClientNote = async (clientId, note) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/clients/${clientId}/notes`,
      { text: note },
      getAuthConfig()
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error adding note to client ${clientId}:`, error);
    return {
      success: false,
      message: error.response?.data?.msg || 'Failed to add note'
    };
  }
};

/**
 * Delete a client (admin only)
 */
export const deleteClient = async (clientId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/api/clients/${clientId}`,
      getAuthConfig()
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error deleting client ${clientId}:`, error);
    return {
      success: false,
      message: error.response?.data?.msg || 'Failed to delete client'
    };
  }
};