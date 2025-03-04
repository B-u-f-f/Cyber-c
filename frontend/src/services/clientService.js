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
    const response = await axios.post(
      `${API_BASE_URL}/api/clients`,
      clientData,
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
    // Add flag to update last contact timestamp if needed
    if (updateLastContact) {
      clientData.updateLastContact = true;
    }
    
    const response = await axios.put(
      `${API_BASE_URL}/api/clients/${clientId}`,
      clientData,
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