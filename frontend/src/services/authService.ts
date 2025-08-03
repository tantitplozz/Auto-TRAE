import axios from 'axios';

const API_URL = '/api/v1/auth';

export const register = async (credentials: any) => {
  const response = await axios.post(`${API_URL}/register`, credentials);
  return response.data;
};

export const login = async (credentials: any) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};
