import axios from 'axios';

const API_BASE_URL = '/api';

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('auth');
    if (authData) {
      const { token } = JSON.parse(authData);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const register = async (name, email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, { name, email, password });
    return response.data;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

export const selectRole = async (role) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/select-role`, { role });
    return response.data;
  } catch (error) {
    console.error('Error selecting role:', error);
    throw error;
  }
};

export const createUser = async ({ email, name, password, role, pmId }) => {
  try {
    const endpoint = pmId ? `${API_BASE_URL}/pm/create-user` : `${API_BASE_URL}/create-user`;
    const payload = pmId ? { email, name, password, role, pmId } : { email, name, password, role };
    const response = await axios.post(endpoint, payload);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};



export const getProjects = async (pmId) => {
  try {
    const endpoint = pmId ? `${API_BASE_URL}/pm/projects/${pmId}` : `${API_BASE_URL}/projects`;
    const response = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

export const updateProjectStatus = async (id, status) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/projects/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const getUsers = async (pmId) => {
  try {
    const endpoint = pmId ? `${API_BASE_URL}/pm/users/${pmId}` : `${API_BASE_URL}/users`;
    const response = await axios.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const createProject = async ({ name, description, createdBy, teamMembers, cardsNumber }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/create-project`, { name, description, createdBy, teamMembers, cardsNumber });
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const getAllProjects = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/projects`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all projects:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

export const getProjectsForTeamMember = async (username) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/team-member/projects/${username}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching projects for team member:', error);
    throw error;
  }
};

export const getProjectDetails = async (projectId, pmId) => {
  try {
    const endpoint = pmId ? `${API_BASE_URL}/pm/projects/${pmId}` : `${API_BASE_URL}/projects`;
    const response = await axios.get(endpoint);
    const projects = response.data;
    return projects.find(p => p._id === projectId);
  } catch (error) {
    console.error('Error fetching project details:', error);
    throw error;
  }
};

export const getChatList = async (projectId, currentUser) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chat/${projectId}/list?currentUser=${currentUser}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat list:', error);
    throw error;
  }
};

export const getChatMessages = async (projectId, chatType, chatId, currentUser) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/chat/${projectId}/${chatType}/${chatId}?currentUser=${currentUser}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
};

export const sendChatMessage = async (projectId, chatType, chatId, sender, message) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/chat/${projectId}/${chatType}/${chatId}`, { sender, message });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export const updateMessageStatus = async (messageId, status) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/chat/message/${messageId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId, sender) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/chat/message/${messageId}`, { data: { sender } });
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

export const editMessage = async (messageId, sender, message) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/chat/message/${messageId}`, { sender, message });
    return response.data;
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

// Card-related API functions
export const getCards = async (projectId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cards/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cards:', error);
    throw error;
  }
};

export const createCard = async (projectId, cardData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/cards`, { ...cardData, projectId });
    return response.data;
  } catch (error) {
    console.error('Error creating card:', error);
    throw error;
  }
};

export const updateCard = async (cardId, updates) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/cards/${cardId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating card:', error);
    throw error;
  }
};

export const deleteCard = async (cardId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/cards/${cardId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting card:', error);
    throw error;
  }
};
