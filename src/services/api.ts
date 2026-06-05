import axios from 'axios';

const API_BASE_URL = 'http://3.149.74.186:8080/v1';
const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3NDI5MjAyOTAsImV4cCI6MzMyMDc1NzA5MCwicmVhZGVyX2lkIjoiMzE4OTI2IiwicmVhZGVyX3R5cGUiOiJ1aG4ifQ.JgiBSrvVEs3xaw-fak9YROWDxiPsbvyT1REWzAt0wU0';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`
  }
});

export interface User {
  id?: string | number;
  name?: string;
  email?: string;
  phone?: string;
  created_at?: string;
  status?: string;
  [key: string]: any;
}

export interface FetchUsersParams {
  limit?: number;
  offset?: number;
  created_from?: string;
  created_to?: string;
  search?: string;
  phone?: string;
  code?: string;
}

export interface FetchUsersResponse {
  total: number;
  data: User[];
}

export const fetchUsers = async (params: FetchUsersParams): Promise<FetchUsersResponse> => {
  try {
    const response = await api.post<FetchUsersResponse>('/users', params);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    // Return empty state if API fails
    return { total: 0, data: [] };
  }
};
