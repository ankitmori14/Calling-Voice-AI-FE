import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Generate LiveKit access token
 * This happens automatically behind the scenes
 */
export const generateToken = async (roomName = 'parul-admission', participantName = null) => {
  try {
    // Generate random participant name if not provided
    const name = participantName || `user-${Math.random().toString(36).substr(2, 9)}`;

    const response = await api.post('/api/auth/token/generate', {
      room_name: roomName,
      participant_name: name,
    });

    return response.data;
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
};

/**
 * Create a new voice session
 */
export const createSession = async (userId = null) => {
  try {
    const response = await api.post('/api/voice/session/create', null, {
      params: { user_id: userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

/**
 * Get session history
 */
export const getSessionHistory = async (sessionId) => {
  try {
    const response = await api.get(`/api/voice/session/${sessionId}/history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw error;
  }
};

/**
 * End a voice session
 */
export const endSession = async (sessionId) => {
  try {
    const response = await api.post(`/api/voice/session/${sessionId}/end`);
    return response.data;
  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
};

export default api;
