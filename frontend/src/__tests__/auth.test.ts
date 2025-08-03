import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:3001/api/v1/auth';

describe('Authentication API', () => {
  const testUser = {
    email: `testuser_${Date.now()}@example.com`,
    password: 'password123',
  };

  it('should register a new user successfully', async () => {
    const response = await axios.post(`${API_URL}/register`, testUser);
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('message', 'User registered successfully');
  });

  it('should not register a user with an existing email', async () => {
    try {
      await axios.post(`${API_URL}/register`, testUser);
    } catch (error: any) {
      expect(error.response.status).toBe(400);
      expect(error.response.data).toHaveProperty('message', 'User already exists');
    }
  });

  it('should log in an existing user successfully', async () => {
    const response = await axios.post(`${API_URL}/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('token');

    const decodedToken: { email: string } = jwtDecode(response.data.token);
    expect(decodedToken.email).toBe(testUser.email);
  });

  it('should not log in with incorrect credentials', async () => {
    try {
      await axios.post(`${API_URL}/login`, {
        email: testUser.email,
        password: 'wrongpassword',
      });
    } catch (error: any) {
      expect(error.response.status).toBe(401);
      expect(error.response.data).toHaveProperty('message', 'Invalid credentials');
    }
  });
});
